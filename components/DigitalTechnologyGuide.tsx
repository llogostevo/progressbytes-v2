"use client";

const DigitalTechnologyGuide = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          💻 Digital Technology Impact Guide (GCSE)
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Key points and simple examples for discussing the impact of digital technology on society. Use these to help
          answer GCSE Computer Science questions.
        </p>
      </div>

      {/* Ethical Issues */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">⚖️ Ethical Issues</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Problems</h3>
            <ul className="space-y-2 text-red-700">
              <li>• Not everyone can afford computers or the internet (digital divide)</li>
              <li>• People can be bullied or treated badly online (cyberbullying)</li>
              <li>• Some people use technology to cheat or copy work</li>
              <li>• Technology can be addictive (e.g. games, social media)</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 text-lg">Benefits</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Easier to keep in touch with friends and family</li>
              <li>• Access to learning and information for more people</li>
              <li>• Helps people with disabilities (e.g. screen readers)</li>
              <li>• Can help people find jobs or work from home</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Issues */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">📜 Legal Issues (UK)</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Problems</h3>
            <ul className="space-y-2 text-red-700">
              <li>• Hacking into computers is illegal (Computer Misuse Act)</li>
              <li>• Copying music, videos, or software without permission is illegal (Copyright law)</li>
              <li>• Sharing personal data without permission breaks the law (Data Protection Act, GDPR)</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 text-lg">Protections</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Laws protect people&apos;s personal data (Data Protection Act, GDPR)</li>
              <li>• Copyright law protects creators&apos; work</li>
              <li>• Computer Misuse Act stops hacking and viruses</li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
          <strong>Tip:</strong> Always mention the law by name if you can!
        </div>
      </div>

      {/* Cultural Issues */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">🌍 Cultural Issues</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Problems</h3>
            <ul className="space-y-2 text-red-700">
              <li>• People spend less time together in person</li>
              <li>• Some cultures or languages may be less visible online</li>
              <li>• People can copy or share things that don&apos;t belong to them</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 text-lg">Benefits</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Learn about other cultures easily</li>
              <li>• Share your own culture with the world</li>
              <li>• Make friends from different countries</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Environmental Issues */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">🌱 Environmental Issues</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Problems</h3>
            <ul className="space-y-2 text-red-700">
              <li>• Old computers and phones create e-waste</li>
              <li>• Making and using computers uses lots of electricity</li>
              <li>• Some parts are hard to recycle</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 text-lg">Solutions</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Recycle old devices</li>
              <li>• Use energy-saving settings</li>
              <li>• Donate working devices to others</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Issues */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">🔒 Privacy Issues</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Problems</h3>
            <ul className="space-y-2 text-red-700">
              <li>• Apps and websites collect personal information</li>
              <li>• Data can be shared or sold without you knowing</li>
              <li>• Hackers can steal personal data</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 text-lg">How to Stay Safe</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Use strong passwords</li>
              <li>• Don&apos;t share personal info online</li>
              <li>• Check privacy settings on apps</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Exam Tips */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">✍️ Exam Tips</h2>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <ul className="space-y-2 text-yellow-800">
            <li>• Give both good and bad points for each issue</li>
            <li>• Use real-life examples (e.g. social media, recycling phones)</li>
            <li>• Name the law if you can (e.g. Data Protection Act)</li>
            <li>• Explain why the issue matters, not just what it is</li>
            <li>• Keep your answer clear and simple</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DigitalTechnologyGuide; 