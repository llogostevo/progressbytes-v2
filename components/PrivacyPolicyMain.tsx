export default function PrivacyPolicyMain() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-6">
              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">1. Who We Are</h2>
                <p className="text-gray-700 leading-relaxed">
                  This application is operated by [Your Name / Company Name] ("we", "us", or "our").
                  Contact: [Your Email Address]
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">2. What Data We Collect</h2>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Name and email address (if you log in)</li>
                  <li>Usage data (e.g., actions in the app)</li>
                  <li>Technical data (browser type, IP address)</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">3. How We Use Your Data</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use data to provide and improve the service, and for safety and support.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">4. Legal Basis</h2>
                <p className="text-gray-700 leading-relaxed">
                  We rely on consent, legitimate interest, and contractual necessity under GDPR.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">5. Data Storage</h2>
                <p className="text-gray-700 leading-relaxed">
                  Data is securely stored using Supabase on servers located in the EU (Frankfurt, Germany).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">6. Sharing Your Data</h2>
                <p className="text-gray-700 leading-relaxed">
                  We only share data with trusted providers like Supabase or if legally required.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">7. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We keep data only as long as needed or until deletion is requested.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">8. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed">
                  You can request access, correction, deletion, or withdrawal of consent at any time.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">9. Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use encryption and secure systems to protect your data.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">10. Changes</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this policy and will notify users of significant changes.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  