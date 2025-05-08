"use client"

const EssayGuide = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-emerald-700">📝 How to Answer OCR Essay Questions (8 Mark Questions)</h1>
        <p className="text-muted-foreground">
          OCR essay questions usually ask you to discuss a topic using 2–3 bullet points (e.g. ethical, legal, privacy).
          Here's how to write a great answer and get top marks!
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-emerald-700">🎯 Step-by-Step Plan</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-emerald-600">1. Read the question carefully</h3>
            <p className="text-muted-foreground">
              Look for the bullet points — these tell you what to talk about. Make sure you cover <span className="font-medium text-foreground">all of them</span>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-emerald-600">2. Use the P.E.E.L. method for each point</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">P</span>oint – What's the issue? (e.g. "A legal issue is data protection.")</li>
              <li><span className="font-medium text-foreground">E</span>xplain – Why does it matter?</li>
              <li><span className="font-medium text-foreground">E</span>xample – Give a real or relevant example</li>
              <li><span className="font-medium text-foreground">L</span>ink – Say how it helps or causes a problem in the situation</li>
            </ul>
            <p className="text-muted-foreground">
              Always give <span className="font-medium text-foreground">positives and negatives</span> for a balanced answer!
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-emerald-600">3. Structure your answer clearly</h3>
            <p className="text-muted-foreground">
              You can use headings or write in paragraphs. Just make sure it's <span className="font-medium text-foreground">easy to follow</span> and well organised.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-emerald-600">4. Include a recommendation (if the question asks for one)</h3>
            <p className="text-muted-foreground">
              Finish with a clear answer to the question. Say what should be done and why, using reasons from your answer.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-emerald-700">✅ What OCR is Looking For</h2>
        <ul className="list-none space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✔</span>
            Covers every bullet point (e.g. legal, ethical, privacy)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✔</span>
            Gives both positive and negative impacts
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✔</span>
            Uses examples and applies to the scenario
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✔</span>
            Clear structure and full sentences
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✔</span>
            A justified conclusion or recommendation (only if the question asks for one)
          </li>
        </ul>
      </div>

      

      
    </div>
  );
};

export default EssayGuide;
