// ============================================
// FILE: src/services/settings.js
// ============================================
import api from './api'

export const settingsService = {
  getSystem: async () => {
    // Expecting something like:
    // {
    //   paybill_number: "...",
    //   stronpower_company_name: "...",
    //   stronpower_username: "...",
    //   stronpower_password: "...",
    //   sms_sender_id: "...",
    //   sms_callback_url: "...",
    //   notify_on_token_issue: true,
    //   notify_on_payment_failure: true,
    //   notify_on_critical_alert: true
    // }
    return api.get('/settings/system/')
  },

  updateSystem: async (data) => {
    return api.put('/settings/system/', data)
  },
}
