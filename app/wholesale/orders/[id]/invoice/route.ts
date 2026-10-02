import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { createAdminClient } from "@/lib/supabase/admin";
import { getWholesaleSession } from "@/lib/wholesale/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatStatus(status: string) {
  return String(status || "")
    .replace(/\_/g, " ")
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
       Verify Wholesale Session
    ========================================================= */

    const session = await getWholesaleSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Wholesale login required.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    const supabase = createAdminClient();

    /* =========================================================
       Get Order
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
      .eq("shipping_phone", session.phone)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: "Wholesale order not found.",
        },
        {
          status: 404,
        }
      );
    }

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
        "Wholesale customer invoice items error:",
        itemsError
      );

      return NextResponse.json(
        {
          error: "Unable to load order items.",
        },
        {
          status: 500,
        }
      );
    }

    /* =========================================================
       Get Wholesale Shop
    ========================================================= */

    const { data: shop } = await supabase
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

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const margin = 40;
    const contentWidth =
      pageWidth - margin * 2;

    /* =========================================================
       Brand Colors
    ========================================================= */

    const navy = rgb(
      0.09,
      0.145,
      0.33
    );

    const darkNavy = rgb(
      0.06,
      0.09,
      0.16
    );

    const coral = rgb(
      0.96,
      0.25,
      0.37
    );

    const green = rgb(
      0.08,
      0.55,
      0.3
    );

    const white = rgb(
      1,
      1,
      1
    );

    const gray = rgb(
      0.38,
      0.42,
      0.48
    );

    const lightGray = rgb(
      0.96,
      0.97,
      0.98
    );

    const borderGray = rgb(
      0.88,
      0.89,
      0.91
    );

    const softCoral = rgb(
      1,
      0.95,
      0.96
    );

    const softGreen = rgb(
      0.92,
      0.98,
      0.94
    );

    /* =========================================================
       Page State
    ========================================================= */

    let page = pdfDoc.addPage([
      pageWidth,
      pageHeight,
    ]);

    let y = pageHeight - margin;

    /* =========================================================
       Drawing Helpers
    ========================================================= */

    function drawText(
      text: string,
      x: number,
      yPosition: number,
      size = 10,
      bold = false,
      color = darkNavy
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

    function drawRightText(
      text: string,
      rightX: number,
      yPosition: number,
      size = 10,
      bold = false,
      color = darkNavy
    ) {
      const font = bold
        ? boldFont
        : regularFont;

      const width =
        font.widthOfTextAtSize(
          String(text),
          size
        );

      drawText(
        String(text),
        rightX - width,
        yPosition,
        size,
        bold,
        color
      );
    }

    function drawLine(
      yPosition: number,
      color = borderGray,
      thickness = 1
    ) {
      page.drawLine({
        start: {
          x: margin,
          y: yPosition,
        },
        end: {
          x: pageWidth - margin,
          y: yPosition,
        },
        thickness,
        color,
      });
    }

    function drawFooter() {
      page.drawLine({
        start: {
          x: margin,
          y: 54,
        },
        end: {
          x: pageWidth - margin,
          y: 54,
        },
        thickness: 0.7,
        color: borderGray,
      });

      drawText(
        "Thank you for doing business with Shree Collection.",
        margin,
        38,
        7.5,
        false,
        gray
      );

      drawRightText(
        "Computer-generated invoice.",
        pageWidth - margin,
        38,
        7.5,
        false,
        gray
      );
    }

    function drawTableHeader() {
      page.drawRectangle({
        x: margin,
        y: y - 20,
        width: contentWidth,
        height: 24,
        color: navy,
      });

      drawText(
        "Product",
        margin + 7,
        y - 12,
        8,
        true,
        white
      );

      drawText(
        "SKU",
        285,
        y - 12,
        8,
        true,
        white
      );

      drawText(
        "Qty",
        365,
        y - 12,
        8,
        true,
        white
      );

      drawText(
        "Price",
        415,
        y - 12,
        8,
        true,
        white
      );

      drawText(
        "Total",
        495,
        y - 12,
        8,
        true,
        white
      );

      y -= 34;
    }

    function addNewPage() {
      drawFooter();

      page = pdfDoc.addPage([
        pageWidth,
        pageHeight,
      ]);

      y = pageHeight - 55;

      drawText(
        "SHREE COLLECTION",
        margin,
        y,
        13,
        true,
        navy
      );

      drawRightText(
        `Invoice: ${safe(
          invoiceOrder.order_number
        )}`,
        pageWidth - margin,
        y,
        8,
        false,
        gray
      );

      y -= 22;

      drawLine(y);

      y -= 18;

      drawTableHeader();
    }

    /* =========================================================
       Header
    ========================================================= */

    page.drawRectangle({
      x: 0,
      y: pageHeight - 112,
      width: pageWidth,
      height: 112,
      color: navy,
    });

    page.drawRectangle({
      x: 0,
      y: pageHeight - 112,
      width: 7,
      height: 112,
      color: coral,
    });

    drawText(
      "SHREE COLLECTION",
      margin,
      pageHeight - 53,
      22,
      true,
      white
    );

    drawText(
      "Wholesale Invoice",
      margin,
      pageHeight - 72,
      9,
      true,
      coral
    );

    drawRightText(
      "INVOICE",
      pageWidth - margin,
      pageHeight - 53,
      14,
      true,
      white
    );

    drawRightText(
      safe(invoiceOrder.order_number),
      pageWidth - margin,
      pageHeight - 70,
      8,
      false,
      rgb(
        0.85,
        0.88,
        0.94
      )
    );

    y = pageHeight - 145;

    /* =========================================================
       Order Information
    ========================================================= */

    page.drawRectangle({
      x: margin,
      y: y - 65,
      width: contentWidth,
      height: 72,
      color: lightGray,
    });

    drawText(
      "ORDER INFORMATION",
      margin + 14,
      y - 13,
      8,
      true,
      navy
    );

    drawText(
      `Order No: ${safe(
        invoiceOrder.order_number
      )}`,
      margin + 14,
      y - 34,
      8.5,
      false,
      gray
    );

    drawText(
      `Date: ${new Date(
        invoiceOrder.created_at
      ).toLocaleDateString("en-IN")}`,
      330,
      y - 34,
      8.5,
      false,
      gray
    );

    drawText(
      `Status: ${formatStatus(
        invoiceOrder.status
      )}`,
      margin + 14,
      y - 51,
      8.5,
      true,
      darkNavy
    );

    drawText(
      `Payment: ${formatStatus(
        invoiceOrder.payment_status
      )}`,
      330,
      y - 51,
      8.5,
      true,
      darkNavy
    );

    y -= 92;

    /* =========================================================
       Bill To
    ========================================================= */

    drawText(
      "BILL TO",
      margin,
      y,
      9,
      true,
      navy
    );

    y -= 18;

    const billStartY = y;

    drawText(
      safe(shop?.shop_name),
      margin,
      y,
      11,
      true,
      darkNavy
    );

    y -= 16;

    drawText(
      `Owner: ${safe(
        shop?.owner_name
      )}`,
      margin,
      y,
      8.5,
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
      8.5,
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
      8.5,
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
      8.5,
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
      8.5,
      false,
      gray
    );

    /* Right customer panel */

    const infoX = 350;

    page.drawRectangle({
      x: infoX,
      y: billStartY - 70,
      width:
        pageWidth -
        margin -
        infoX,
      height: 80,
      color: softCoral,
    });

    drawText(
      "WHOLESALE CUSTOMER",
      infoX + 12,
      billStartY - 15,
      7.5,
      true,
      navy
    );

    drawText(
      safe(shop?.shop_name),
      infoX + 12,
      billStartY - 32,
      9,
      true,
      darkNavy
    );

    drawText(
      `Phone: ${safe(
        shop?.phone ||
          invoiceOrder.shipping_phone
      )}`,
      infoX + 12,
      billStartY - 48,
      8,
      false,
      gray
    );

    drawText(
      `GST: ${safe(
        shop?.gst_number
      )}`,
      infoX + 12,
      billStartY - 63,
      8,
      false,
      gray
    );

    y -= 35;

    /* =========================================================
       Product Table
    ========================================================= */

    drawText(
      "ORDER ITEMS",
      margin,
      y,
      9,
      true,
      navy
    );

    y -= 18;

    drawTableHeader();

    for (const item of items || []) {
      if (y < 150) {
        addNewPage();
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
        margin + 7,
        y,
        8,
        false,
        darkNavy
      );

      drawText(
        safe(item.sku),
        285,
        y,
        8,
        false,
        gray
      );

      drawText(
        String(item.quantity),
        365,
        y,
        8,
        false,
        darkNavy
      );

      drawText(
        money(
          Number(item.unit_price)
        ),
        415,
        y,
        8,
        false,
        darkNavy
      );

      drawRightText(
        money(
          Number(item.total_price)
        ),
        pageWidth - margin - 7,
        y,
        8,
        true,
        darkNavy
      );

      y -= 22;

      page.drawLine({
        start: {
          x: margin,
          y: y + 7,
        },
        end: {
          x: pageWidth - margin,
          y: y + 7,
        },
        thickness: 0.4,
        color: borderGray,
      });
    }

    /* =========================================================
       Summary
    ========================================================= */

    y -= 18;

    if (y < 205) {
      addNewPage();
      y -= 5;
    }

    const summaryWidth = 210;

    const summaryX =
      pageWidth -
      margin -
      summaryWidth;

    page.drawRectangle({
      x: summaryX,
      y: y - 108,
      width: summaryWidth,
      height: 118,
      color: lightGray,
    });

    drawText(
      "ORDER SUMMARY",
      summaryX + 12,
      y - 16,
      8,
      true,
      navy
    );

    drawText(
      "Subtotal",
      summaryX + 12,
      y - 37,
      8.5,
      false,
      gray
    );

    drawRightText(
      money(
        Number(
          invoiceOrder.subtotal
        )
      ),
      summaryX +
        summaryWidth -
        12,
      y - 37,
      8.5,
      true,
      darkNavy
    );

    drawText(
      "Shipping",
      summaryX + 12,
      y - 54,
      8.5,
      false,
      gray
    );

    drawRightText(
      Number(
        invoiceOrder.shipping_amount
      ) === 0
        ? "FREE"
        : money(
            Number(
              invoiceOrder.shipping_amount
            )
          ),
      summaryX +
        summaryWidth -
        12,
      y - 54,
      8.5,
      true,
      darkNavy
    );

    drawText(
      "Discount",
      summaryX + 12,
      y - 71,
      8.5,
      false,
      gray
    );

    drawRightText(
      money(
        Number(
          invoiceOrder.discount_amount
        )
      ),
      summaryX +
        summaryWidth -
        12,
      y - 71,
      8.5,
      true,
      darkNavy
    );

    page.drawLine({
      start: {
        x: summaryX + 12,
        y: y - 82,
      },
      end: {
        x:
          summaryX +
          summaryWidth -
          12,
        y: y - 82,
      },
      thickness: 0.8,
      color: navy,
    });

    drawText(
      "Grand Total",
      summaryX + 12,
      y - 99,
      10,
      true,
      navy
    );

    drawRightText(
      money(
        Number(
          invoiceOrder.total_amount
        )
      ),
      summaryX +
        summaryWidth -
        12,
      y - 99,
      10,
      true,
      coral
    );

    /* =========================================================
       Payment Information
    ========================================================= */

    y -= 140;

    if (y < 120) {
      addNewPage();
      y -= 5;
    }

    page.drawRectangle({
      x: margin,
      y: y - 55,
      width: contentWidth,
      height: 62,
      color: softGreen,
    });

    drawText(
      "PAYMENT INFORMATION",
      margin + 12,
      y - 15,
      8,
      true,
      green
    );

    drawText(
      `Payment Status: ${formatStatus(
        invoiceOrder.payment_status
      )}`,
      margin + 12,
      y - 34,
      8.5,
      true,
      darkNavy
    );

    drawText(
      `Payment Method: ${safe(
        invoiceOrder.payment_method
      )}`,
      300,
      y - 34,
      8.5,
      false,
      gray
    );

    /* =========================================================
       Footer
    ========================================================= */

    drawFooter();

    /* =========================================================
       Generate PDF
    ========================================================= */

    const pdfBytes = await pdfDoc.save();

    const pdfBody =
      Buffer.from(pdfBytes) as unknown as BodyInit;

    return new NextResponse(
      pdfBody,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="Invoice-${invoiceOrder.order_number}.pdf"`,

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Wholesale customer invoice error:",
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