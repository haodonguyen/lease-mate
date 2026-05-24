"use client";

import { generateUploadButton } from "@uploadthing/react";
import type { LeaseMateFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<LeaseMateFileRouter>();
