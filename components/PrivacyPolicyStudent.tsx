export default function PrivacyPolicyStudent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Student-Friendly Privacy Policy</h1>
              <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              <p className="text-gray-700 leading-relaxed">
                This page explains how we protect your data when you use this app — whether you're at
                school, home, or somewhere else. You can use some parts of the app without logging in,
                and we collect as little info as possible.
              </p>
            </div>

            <div className="space-y-6">
              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">What We Collect</h2>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>If you don't log in: page visits, clicks, device type, and cookies</li>
                  <li>If you log in: name or nickname, email, saved answers or progress</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">Why We Collect It</h2>
                <p className="text-gray-700 leading-relaxed">
                  To help you use the app, save your work, and make the app better for everyone.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">Where It's Stored</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use Supabase to store data safely in Europe (Germany). They follow all GDPR rules.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">Who Can See It</h2>
                <p className="text-gray-700 leading-relaxed">
                  Only you, the app team (us), and trusted services like Supabase can see your data.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed">
                  You can ask to see your data, change it, or delete it by emailing us at [Your Email Address].
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-600">Staying Safe</h2>
                <p className="text-gray-700 leading-relaxed">
                  We do our best to keep your info safe and never sell your data to anyone.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  