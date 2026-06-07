export interface PublicConfig {
  site_name: string;
  site_subtitle: string;
  logo_url: string;
  favicon_url: string;
  copyright: string;
  icp_number: string;
  icp_number_show: boolean;
  psb_number: string;
  psb_number_show: boolean;
  contact_email: string;
  support_email: string;
  default_language: string;
  default_timezone: string;
  maintenance_mode: boolean;
  maintenance_notice: string;
  home_notice: string;
  login_notice: string;
  register_notice: string;
  footer_content: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  allow_register: boolean;
  allow_change_email: boolean;
  allow_change_username: boolean;
  allow_create_api_key: boolean;
  allow_delete_api_key: boolean;
  allow_webhook: boolean;
  allow_organization: boolean;
  allow_delete_account: boolean;
  email_verify: boolean;
  captcha_enabled: boolean;
  invite_code_required: boolean;
  whitelist_enabled: boolean;
  captcha_identity: string;
  captcha_region: string;
  captcha_mode: string;
  captcha_register_enabled: boolean;
  captcha_register_scene_id: string;
  captcha_login_enabled: boolean;
  captcha_login_scene_id: string;
  captcha_forgot_password_enabled: boolean;
  captcha_forgot_password_scene_id: string;
  captcha_send_email_code_enabled: boolean;
  captcha_send_email_code_scene_id: string;
}

export interface PublicModel {
  id: string;
  name: string;
  vendor?: string;
  input_price?: number | null;
  output_price?: number | null;
  description?: string | null;
}

export interface ChannelStatus {
  name: string;
  healthy: boolean;
  message?: string | null;
  last_checked?: string | null;
}
