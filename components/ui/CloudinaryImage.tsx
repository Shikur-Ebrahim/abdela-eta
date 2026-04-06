"use client";

import { CldImage, CldImageProps } from "next-cloudinary";

export default function CloudinaryImage(props: CldImageProps) {
    return <CldImage {...props} />;
}
