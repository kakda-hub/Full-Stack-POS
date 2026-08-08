export interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  asset_folder?: string;
  display_name?: string;
  url: string;
  secure_url: string;
}

/**
 * Flat standard envelope returned by GET /api/v1/cloudinary.
 * The endpoint uses @SkipIntercept(), so `data` is the resources array itself
 * (no nested data.data.resources wrapping).
 */
export interface CloudinaryApiResponse {
  success: boolean;
  statusCode: number;
  data: CloudinaryResource[];
  total?: number;
  timestamp?: string;
}
