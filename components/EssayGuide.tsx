"use client";

const EssayGuide = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
          📝 How to Answer OCR Essay Questions (8-Mark Questions)
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          OCR 8-mark questions usually give you 2–3 bullet points to discuss (like ethical, legal, environmental
          impacts). You should aim to make <span className="font-medium text-foreground">3 well-balanced points</span>,
          one for each bullet. Use the simple "3 x IEEP" method to get top marks.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-700 flex items-center gap-2">
          🎯 Step-by-Step: Use "3 x IEEP"
        </h2>
        <p className="text-muted-foreground text-base">
          For each bullet point in the question, write one paragraph using this format:
        </p>
        <ul className="list-disc pl-6 space-y-3 text-base">
          <li>
            <span className="font-medium text-foreground">I – Impact:</span>
            <span className="text-muted-foreground"> Say what the effect is (positive or negative)</span>
          </li>
          <li>
            <span className="font-medium text-foreground">E – Explain:</span>
            <span className="text-muted-foreground"> Say why this impact matters or what it causes</span>
          </li>
          <li>
            <span className="font-medium text-foreground">E – Example:</span>
            <span className="text-muted-foreground"> Give a real or relevant example, or link to the scenario</span>
          </li>
          <li>
            <span className="font-medium text-foreground">P – Point out the other side:</span>
            <span className="text-muted-foreground"> Give a short counterpoint to show balance</span>
          </li>
        </ul>
        <p className="text-muted-foreground text-base">
          Do this <span className="font-medium text-foreground">three times</span> (once for each bullet point). This
          keeps your answer clear and balanced.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-700 flex items-center gap-2">🧠 Example Structure</h2>
        <p className="text-muted-foreground text-base mb-4">
          Question: Discuss the ethical, legal, and environmental issues of using facial recognition in schools.
        </p>
        <div className="bg-muted p-6 rounded-lg space-y-4 text-base">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Ethical:</strong> An ethical concern is student privacy (Impact). This
            matters because students might feel watched or lose trust in the school (Explain). For example, they may not
            want their faces stored on a database (Example). However, some students might feel safer knowing the school
            is more secure (Point out the other side).
          </p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Legal:</strong> A legal issue is following the Data Protection Act
            (Impact). Schools must store and use biometric data legally (Explain). For example, if they don't get proper
            consent, they could face fines (Example). On the other hand, if schools follow the law carefully, this may
            not be a problem (Point out the other side).
          </p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Environmental:</strong> Facial recognition systems use electricity
            (Impact). This increases energy usage and may harm the environment (Explain). For example, a system that
            runs all day uses more energy than one that only runs at the entrance (Example). But this effect could be
            reduced by using energy-efficient hardware (Point out the other side).
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-700 flex items-center gap-2">
          ✅ What OCR Examiners Look For
        </h2>
        <ul className="list-none space-y-3 text-base">
          <li className="flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✔</span>
            <span className="text-muted-foreground">Three well-developed and balanced points</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✔</span>
            <span className="text-muted-foreground">Each point is clearly linked to the bullet prompts</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✔</span>
            <span className="text-muted-foreground">Real examples and application to the scenario</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✔</span>
            <span className="text-muted-foreground">Balanced – includes both sides of the argument</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✔</span>
            <span className="text-muted-foreground">A short conclusion if a judgement is asked for</span>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-700 flex items-center gap-2">🚫 Common Mistakes</h2>
        <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
          <li>Only writing one or two points instead of three</li>
          <li>Listing facts without explaining them</li>
          <li>Missing the opposite side of the argument</li>
          <li>Not using examples or linking to the question</li>
          <li>Writing one long paragraph instead of clear separate points</li>
        </ul>
      </div>
    </div>
  )
}

export default EssayGuide;
