import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { getWholesaleSession } from "@/lib/wholesale/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    /* =========================================================
       Verify Wholesale Session
    ========================================================= */

    const session = await getWholesaleSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Wholesale session expired. Please login again.",
        },
        { status: 401 }
      );
    }

    /* =========================================================
       Supabase Admin Client
    ========================================================= */

    const supabase = createAdminClient();

    /* =========================================================
       Get Order
    ========================================================= */

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          order_type,
          status,
          subtotal,
          shipping_amount,
          discount_amount,
          total_amount,
          payment_status,
          payment_method,
          shipping_name,
          shipping_phone,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pincode,
          created_at
        `
        )
        .eq("id", id)
        .eq("order_type", "wholesale")
        .eq("shipping_phone", session.phone)
        .single();

    if (orderError || !order) {
      console.error(
        "Invoice order lookup error:",
        orderError
      );

      return NextResponse.json(
        {
          error: "Wholesale order not found.",
        },
        { status: 404 }
      );
    }

    /* =========================================================
       Get Order Items
    ========================================================= */

    const { data: items, error: itemsError } =
      await supabase
        .from("order_items")
        .select(
          `
          id,
          product_name,
          sku,
          quantity,
          unit_price,
          total_price
        `
        )
        .eq("order_id", order.id)
        .order("created_at", {
          ascending: true,
        });

    if (itemsError) {
      console.error(
        "Invoice items lookup error:",
        itemsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load order items.",
        },
        { status: 500 }
      );
    }

    /* =========================================================
       Get Wholesale Shop
    ========================================================= */

    const { data: shop } = await supabase
      .from("wholesale_shops")
      .select(
        `
        id,
        shop_name,
        owner_name,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number
      `
      )
      .eq("phone", session.phone)
      .maybeSingle();

    /* =========================================================
       Create PDF
    ========================================================= */

    const pdfDoc = await PDFDocument.create();

    const regularFont = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const boldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    const page = pdfDoc.addPage([
      595.28,
      841.89,
    ]);

    const { width, height } = page.getSize();

    const navy = rgb(
      23 / 255,
      37 / 255,
      84 / 255
    );

    const yellow = rgb(
      1,
      201 / 255,
      40 / 255
    );

    let y = height - 50;

    /* =========================================================
       Header
    ========================================================= */

    page.drawText("SHREE COLLECTION", {
      x: 40,
      y,
      size: 22,
      font: boldFont,
      color: navy,
    });

    y -= 25;

    page.drawText("WHOLESALE INVOICE", {
      x: 40,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(
      `Invoice: ${order.order_number}`,
      {
        x: 380,
        y,
        size: 10,
        font: regularFont,
      }
    );

    y -= 18;

    page.drawText(
      `Date: ${new Date(
        order.created_at
      ).toLocaleDateString("en-IN")}`,
      {
        x: 380,
        y,
        size: 10,
        font: regularFont,
      }
    );

    y -= 35;

    page.drawRectangle({
      x: 40,
      y,
      width: width - 80,
      height: 3,
      color: yellow,
    });

    y -= 30;

    /* =========================================================
       Shop Details
    ========================================================= */

    page.drawText("BILL TO", {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: navy,
    });

    y -= 18;

    page.drawText(
      shop?.shop_name ||
        order.shipping_name ||
        "Wholesale Customer",
      {
        x: 40,
        y,
        size: 11,
        font: boldFont,
      }
    );

    y -= 16;

    if (shop?.owner_name) {
      page.drawText(
        `Owner: ${shop.owner_name}`,
        {
          x: 40,
          y,
          size: 9,
          font: regularFont,
        }
      );

      y -= 14;
    }

    page.drawText(
      `Phone: ${
        order.shipping_phone ||
        shop?.phone ||
        "-"
      }`,
      {
        x: 40,
        y,
        size: 9,
        font: regularFont,
      }
    );

    y -= 14;

    if (shop?.gst_number) {
      page.drawText(
        `GSTIN: ${shop.gst_number}`,
        {
          x: 40,
          y,
          size: 9,
          font: regularFont,
        }
      );

      y -= 14;
    }

    const addressParts = [
      order.shipping_address,
      order.shipping_city,
      order.shipping_state,
      order.shipping_pincode,
    ].filter(Boolean);

    if (addressParts.length > 0) {
      page.drawText(
        `Address: ${addressParts.join(", ")}`,
        {
          x: 40,
          y,
          size: 9,
          font: regularFont,
          maxWidth: width - 80,
        }
      );

      y -= 28;
    } else {
      y -= 14;
    }

    /* =========================================================
       Items Header
    ========================================================= */

    const tableTop = y;

    page.drawRectangle({
      x: 40,
      y: tableTop - 22,
      width: width - 80,
      height: 22,
      color: navy,
    });

    page.drawText("Product", {
      x: 48,
      y: tableTop - 15,
      size: 9,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText("Qty", {
      x: 350,
      y: tableTop - 15,
      size: 9,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText("Unit Price", {
      x: 400,
      y: tableTop - 15,
      size: 9,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText("Total", {
      x: 500,
      y: tableTop - 15,
      size: 9,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    y = tableTop - 42;

    /* =========================================================
       Items
    ========================================================= */

    for (const item of items || []) {
      if (y < 150) {
        break;
      }

      const productName =
        item.product_name || "Product";

      const sku = item.sku
        ? `SKU: ${item.sku}`
        : "";

      page.drawText(
        productName.substring(0, 42),
        {
          x: 48,
          y,
          size: 9,
          font: boldFont,
        }
      );

      if (sku) {
        page.drawText(
          sku.substring(0, 42),
          {
            x: 48,
            y: y - 11,
            size: 7,
            font: regularFont,
          }
        );
      }

      page.drawText(
        String(item.quantity),
        {
          x: 355,
          y,
          size: 9,
          font: regularFont,
        }
      );

      page.drawText(
        `Rs. ${Number(
          item.unit_price
        ).toFixed(2)}`,
        {
          x: 400,
          y,
          size: 9,
          font: regularFont,
        }
      );

      page.drawText(
        `Rs. ${Number(
          item.total_price
        ).toFixed(2)}`,
        {
          x: 500,
          y,
          size: 9,
          font: boldFont,
        }
      );

      y -= sku ? 30 : 24;

      page.drawLine({
        start: {
          x: 40,
          y: y + 8,
        },
        end: {
          x: width - 40,
          y: y + 8,
        },
        thickness: 0.5,
        color: rgb(
          0.85,
          0.85,
          0.85
        ),
      });
    }

    /* =========================================================
       Summary
    ========================================================= */

    y -= 20;

    const summaryX = 390;

    page.drawText("Subtotal", {
      x: summaryX,
      y,
      size: 9,
      font: regularFont,
    });

    page.drawText(
      `Rs. ${Number(
        order.subtotal
      ).toFixed(2)}`,
      {
        x: 500,
        y,
        size: 9,
        font: regularFont,
      }
    );

    y -= 18;

    page.drawText("Shipping", {
      x: summaryX,
      y,
      size: 9,
      font: regularFont,
    });

    page.drawText(
      `Rs. ${Number(
        order.shipping_amount
      ).toFixed(2)}`,
      {
        x: 500,
        y,
        size: 9,
        font: regularFont,
      }
    );

    if (
      Number(order.discount_amount) > 0
    ) {
      y -= 18;

      page.drawText("Discount", {
        x: summaryX,
        y,
        size: 9,
        font: regularFont,
      });

      page.drawText(
        `- Rs. ${Number(
          order.discount_amount
        ).toFixed(2)}`,
        {
          x: 500,
          y,
          size: 9,
          font: regularFont,
        }
      );
    }

    y -= 25;

    page.drawLine({
      start: {
        x: summaryX,
        y: y + 10,
      },
      end: {
        x: width - 40,
        y: y + 10,
      },
      thickness: 1,
      color: navy,
    });

    page.drawText("TOTAL", {
      x: summaryX,
      y,
      size: 12,
      font: boldFont,
      color: navy,
    });

    page.drawText(
      `Rs. ${Number(
        order.total_amount
      ).toFixed(2)}`,
      {
        x: 490,
        y,
        size: 12,
        font: boldFont,
        color: navy,
      }
    );

    /* =========================================================
       Payment
    ========================================================= */

    y -= 35;

    page.drawText(
      `Payment Status: ${
        order.payment_status ||
        "pending"
      }`,
      {
        x: 40,
        y,
        size: 9,
        font: boldFont,
      }
    );

    page.drawText(
      `Payment Method: ${
        order.payment_method ||
        "Not specified"
      }`,
      {
        x: 40,
        y: y - 14,
        size: 9,
        font: regularFont,
      }
    );

    /* =========================================================
       Footer
    ========================================================= */

    page.drawText(
      "Thank you for doing business with Shree Collection.",
      {
        x: 40,
        y: 45,
        size: 8,
        font: regularFont,
        color: rgb(
          0.4,
          0.4,
          0.4
        ),
      }
    );

    /* =========================================================
       Save PDF
    ========================================================= */

    const pdfBytes =
      await pdfDoc.save();

    /*
     * pdf-lib returns Uint8Array<ArrayBufferLike>.
     * Create a standalone ArrayBuffer so TypeScript's
     * BodyInit type is satisfied by the Blob.
     */
    const pdfBuffer =
      new ArrayBuffer(
        pdfBytes.byteLength
      );

    new Uint8Array(pdfBuffer).set(
      pdfBytes
    );

    const pdfBlob = new Blob(
      [pdfBuffer],
      {
        type: "application/pdf",
      }
    );

    return new NextResponse(
      pdfBlob,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition": `attachment; filename="Invoice-${order.order_number}.pdf"`,

          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Wholesale invoice generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate invoice.",
      },
      { status: 500 }
    );
  }
}