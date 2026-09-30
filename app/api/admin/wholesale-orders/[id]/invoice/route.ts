import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return null;
  }

  return createAdminClient();
}

function formatStatus(status: string) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function money(value: number) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function safe(value: unknown) {
  return value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
    ? String(value)
    : "—";
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    /* =========================================================
       Verify Admin
    ========================================================= */

    const supabase = await verifyAdmin();

    if (!supabase) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    /* =========================================================
       Get Wholesale Order
    ========================================================= */

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(`
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
      `)
      .eq("id", id)
      .eq("order_type", "wholesale")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error:
            "Wholesale order not found.",
        },
        {
          status: 404,
        }
      );
    }

    // After the null check above, TypeScript can safely
    // treat this as the verified wholesale order.
    const invoiceOrder = order;

    /* =========================================================
       Get Order Items
    ========================================================= */

    const {
      data: items,
      error: itemsError,
    } = await supabase
      .from("order_items")
      .select(`
        id,
        product_name,
        sku,
        quantity,
        unit_price,
        total_price
      `)
      .eq("order_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (itemsError) {
      console.error(
        "Invoice order items error:",
        itemsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load order items.",
        },
        {
          status: 500,
        }
      );
    }

    /* =========================================================
       Get Wholesale Shop
    ========================================================= */

    const {
      data: shop,
      error: shopError,
    } = await supabase
      .from("wholesale_shops")
      .select(`
        id,
        shop_name,
        owner_name,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number
      `)
      .eq("phone", invoiceOrder.shipping_phone)
      .maybeSingle();

    if (shopError) {
      console.error(
        "Invoice shop lookup error:",
        shopError
      );
    }

    /* =========================================================
       Create PDF
    ========================================================= */

    const pdfDoc =
      await PDFDocument.create();

    const regularFont =
      await pdfDoc.embedFont(
        StandardFonts.Helvetica
      );

    const boldFont =
      await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    let page = pdfDoc.addPage([
      pageWidth,
      pageHeight,
    ]);

    const margin = 40;

    let y = pageHeight - 50;

    const darkBlue = rgb(
      0.09,
      0.145,
      0.33
    );

    const green = rgb(
      0.08,
      0.55,
      0.3
    );

    const gray = rgb(
      0.4,
      0.4,
      0.4
    );

    const lightGray = rgb(
      0.95,
      0.96,
      0.98
    );

    function drawText(
      text: string,
      x: number,
      yPosition: number,
      size = 10,
      bold = false,
      color = rgb(0, 0, 0)
    ) {
      page.drawText(String(text), {
        x,
        y: yPosition,
        size,
        font: bold
          ? boldFont
          : regularFont,
        color,
      });
    }

    /* =========================================================
       Header
    ========================================================= */

    drawText(
      "SHREE COLLECTION",
      margin,
      y,
      22,
      true,
      darkBlue
    );

    y -= 20;

    drawText(
      "WHOLESALE INVOICE",
      margin,
      y,
      11,
      true,
      green
    );

    drawText(
      "INVOICE",
      455,
      y + 12,
      13,
      true,
      darkBlue
    );

    y -= 30;

    page.drawLine({
      start: {
        x: margin,
        y,
      },
      end: {
        x: pageWidth - margin,
        y,
      },
      thickness: 1,
      color: rgb(
        0.85,
        0.85,
        0.85
      ),
    });

    y -= 25;

    /* =========================================================
       Order Information
    ========================================================= */

    drawText(
      "Order Information",
      margin,
      y,
      11,
      true,
      darkBlue
    );

    y -= 20;

    drawText(
      `Order No: ${safe(
        invoiceOrder.order_number
      )}`,
      margin,
      y,
      9,
      false,
      gray
    );

    drawText(
      `Date: ${new Date(
        invoiceOrder.created_at
      ).toLocaleDateString("en-IN")}`,
      350,
      y,
      9,
      false,
      gray
    );

    y -= 30;

    /* =========================================================
       Bill To
    ========================================================= */

    drawText(
      "Bill To",
      margin,
      y,
      11,
      true,
      darkBlue
    );

    y -= 18;

    drawText(
      safe(shop?.shop_name),
      margin,
      y,
      10,
      true
    );

    y -= 15;

    drawText(
      `Owner: ${safe(
        shop?.owner_name
      )}`,
      margin,
      y,
      9,
      false,
      gray
    );

    y -= 14;

    drawText(
      `Phone: ${safe(
        shop?.phone ||
          invoiceOrder.shipping_phone
      )}`,
      margin,
      y,
      9,
      false,
      gray
    );

    y -= 14;

    drawText(
      `GST Number: ${safe(
        shop?.gst_number
      )}`,
      margin,
      y,
      9,
      false,
      gray
    );

    y -= 14;

    drawText(
      safe(
        shop?.address ||
          invoiceOrder.shipping_address
      ),
      margin,
      y,
      9,
      false,
      gray
    );

    y -= 14;

    drawText(
      `${safe(
        shop?.city ||
          invoiceOrder.shipping_city
      )}, ${safe(
        shop?.state ||
          invoiceOrder.shipping_state
      )} - ${safe(
        shop?.pincode ||
          invoiceOrder.shipping_pincode
      )}`,
      margin,
      y,
      9,
      false,
      gray
    );

    y -= 30;

    /* =========================================================
       Product Table Header
    ========================================================= */

    const tableX = margin;

    const tableWidth =
      pageWidth - margin * 2;

    const colProduct = tableX + 5;
    const colSku = 285;
    const colQty = 365;
    const colPrice = 415;
    const colTotal = 495;

    page.drawRectangle({
      x: tableX,
      y: y - 18,
      width: tableWidth,
      height: 22,
      color: lightGray,
    });

    drawText(
      "Product",
      colProduct,
      y - 12,
      8,
      true,
      darkBlue
    );

    drawText(
      "SKU",
      colSku,
      y - 12,
      8,
      true,
      darkBlue
    );

    drawText(
      "Qty",
      colQty,
      y - 12,
      8,
      true,
      darkBlue
    );

    drawText(
      "Price",
      colPrice,
      y - 12,
      8,
      true,
      darkBlue
    );

    drawText(
      "Total",
      colTotal,
      y - 12,
      8,
      true,
      darkBlue
    );

    y -= 32;

    /* =========================================================
       Product Rows
    ========================================================= */

    for (const item of items || []) {
      /*
       * Start a new page if required.
       */

      if (y < 120) {
        page = pdfDoc.addPage([
          pageWidth,
          pageHeight,
        ]);

        y = pageHeight - 60;

        page.drawRectangle({
          x: tableX,
          y: y - 18,
          width: tableWidth,
          height: 22,
          color: lightGray,
        });

        drawText(
          "Product",
          colProduct,
          y - 12,
          8,
          true,
          darkBlue
        );

        drawText(
          "SKU",
          colSku,
          y - 12,
          8,
          true,
          darkBlue
        );

        drawText(
          "Qty",
          colQty,
          y - 12,
          8,
          true,
          darkBlue
        );

        drawText(
          "Price",
          colPrice,
          y - 12,
          8,
          true,
          darkBlue
        );

        drawText(
          "Total",
          colTotal,
          y - 12,
          8,
          true,
          darkBlue
        );

        y -= 32;
      }

      let productName = safe(
        item.product_name
      );

      if (productName.length > 34) {
        productName =
          productName.substring(
            0,
            31
          ) + "...";
      }

      drawText(
        productName,
        colProduct,
        y,
        8
      );

      drawText(
        safe(item.sku),
        colSku,
        y,
        8
      );

      drawText(
        String(item.quantity),
        colQty,
        y,
        8
      );

      drawText(
        money(
          Number(item.unit_price)
        ),
        colPrice,
        y,
        8
      );

      drawText(
        money(
          Number(item.total_price)
        ),
        colTotal,
        y,
        8
      );

      y -= 22;

      page.drawLine({
        start: {
          x: tableX,
          y: y + 7,
        },
        end: {
          x: pageWidth - margin,
          y: y + 7,
        },
        thickness: 0.5,
        color: rgb(
          0.9,
          0.9,
          0.9
        ),
      });
    }

    /* =========================================================
       Summary
    ========================================================= */

    y -= 20;

    if (y < 180) {
      page = pdfDoc.addPage([
        pageWidth,
        pageHeight,
      ]);

      y = pageHeight - 60;
    }

    const summaryX = 365;

    drawText(
      "Subtotal",
      summaryX,
      y,
      9,
      false,
      gray
    );

    drawText(
      money(
        Number(invoiceOrder.subtotal)
      ),
      490,
      y,
      9,
      true
    );

    y -= 18;

    drawText(
      "Shipping",
      summaryX,
      y,
      9,
      false,
      gray
    );

    drawText(
      money(
        Number(
          invoiceOrder.shipping_amount
        )
      ),
      490,
      y,
      9,
      true
    );

    y -= 18;

    drawText(
      "Discount",
      summaryX,
      y,
      9,
      false,
      gray
    );

    drawText(
      money(
        Number(
          invoiceOrder.discount_amount
        )
      ),
      490,
      y,
      9,
      true
    );

    y -= 20;

    page.drawLine({
      start: {
        x: summaryX,
        y,
      },
      end: {
        x: pageWidth - margin,
        y,
      },
      thickness: 1,
      color: darkBlue,
    });

    y -= 20;

    drawText(
      "Grand Total",
      summaryX,
      y,
      12,
      true,
      darkBlue
    );

    drawText(
      money(
        Number(invoiceOrder.total_amount)
      ),
      480,
      y,
      12,
      true,
      green
    );

    /* =========================================================
       Status
    ========================================================= */

    y -= 35;

    drawText(
      `Order Status: ${formatStatus(
        invoiceOrder.status
      )}`,
      margin,
      y,
      9,
      true
    );

    drawText(
      `Payment Status: ${formatStatus(
        invoiceOrder.payment_status
      )}`,
      300,
      y,
      9,
      true
    );

    y -= 20;

    drawText(
      `Payment Method: ${safe(
        invoiceOrder.payment_method
      )}`,
      margin,
      y,
      9,
      false,
      gray
    );

    /* =========================================================
       Footer
    ========================================================= */

    drawText(
      "Thank you for doing business with Shree Collection.",
      margin,
      55,
      8,
      false,
      gray
    );

    drawText(
      "Computer-generated invoice.",
      400,
      55,
      8,
      false,
      gray
    );

    /* =========================================================
       Generate PDF
    ========================================================= */

    const pdfBytes =
      await pdfDoc.save();

    /*
     * NextResponse expects a BodyInit.
     * pdf-lib returns a Uint8Array, so explicitly convert
     * it to a compatible typed value for the Next.js response.
     */
    const pdfBody =
      new Uint8Array(pdfBytes) as unknown as BodyInit;

    return new NextResponse(
      pdfBody,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition": `attachment; filename="Invoice-${invoiceOrder.order_number}.pdf"`,

          "Cache-Control":
            "no-store",
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
      {
        status: 500,
      }
    );
  }
}