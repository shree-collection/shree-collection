import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // --------------------------------------------------------
    // Check logged-in user
    // --------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------------
    // Check admin
    // --------------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      profile?.user_type !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------------
    // Read form data
    // --------------------------------------------------------

    const formData = await request.formData();

    /*
     * New format:
     *
     * formData.append("files", file)
     *
     * We also support the old:
     *
     * formData.append("file", file)
     */

    const files = formData.getAll("files");

    let imageFiles = files.filter(
      (file): file is File =>
        file instanceof File
    );

    // --------------------------------------------------------
    // Backward compatibility
    // --------------------------------------------------------

    if (imageFiles.length === 0) {
      const singleFile = formData.get("file");

      if (singleFile instanceof File) {
        imageFiles = [singleFile];
      }
    }

    // --------------------------------------------------------
    // Check files
    // --------------------------------------------------------

    if (imageFiles.length === 0) {
      return NextResponse.json(
        {
          error: "Please select at least one image.",
        },
        { status: 400 }
      );
    }

    if (imageFiles.length > MAX_FILES) {
      return NextResponse.json(
        {
          error: `You can upload a maximum of ${MAX_FILES} images at a time.`,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // Validate all files before uploading
    // --------------------------------------------------------

    for (const file of imageFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid image type for "${file.name}". Only JPG, PNG and WEBP images are allowed.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `"${file.name}" is larger than 5 MB.`,
          },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          {
            error: `"${file.name}" is empty.`,
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------------
    // Upload all images
    // --------------------------------------------------------

    const uploadedImages: {
      imageUrl: string;
      path: string;
      fileName: string;
    }[] = [];

    for (const file of imageFiles) {
      // Get extension
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      // Generate unique file name
      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-images")
        .upload(
          filePath,
          file,
          {
            contentType: file.type,
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          "Image upload error:",
          uploadError
        );

        return NextResponse.json(
          {
            error:
              uploadError.message ||
              "Unable to upload image.",
          },
          { status: 500 }
        );
      }

      // Get public URL
      const {
        data: {
          publicUrl,
        },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedImages.push({
        imageUrl: publicUrl,
        path: filePath,
        fileName: file.name,
      });
    }

    // --------------------------------------------------------
    // Return uploaded images
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,

      // New multiple-image response
      images: uploadedImages,

      // Keep imageUrl for backward compatibility
      // with existing single-image code.
      imageUrl:
        uploadedImages[0]?.imageUrl || null,

      path:
        uploadedImages[0]?.path || null,
    });
  } catch (error) {
    console.error(
      "Upload image API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to upload image.",
      },
      { status: 500 }
    );
  }
}