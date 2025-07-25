"use client";

const ComputerScienceLawsGuide = () => {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            📚 Computer Science Laws & Software Licences
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Key UK laws and software licences you need to know for GCSE Computer Science. Use these points to help answer
            exam questions about legislation and licensing.
          </p>
        </div>
  
        {/* Data Protection Act 2018 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">Data Protection Act 2018</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">What the law covers:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">1</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Protects personal data</span>
                    <span className="text-gray-600"> - names, addresses, and other personal information</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">2</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Organisations must keep data safe</span>
                    <span className="text-gray-600"> - only use it for the reason they collected it</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">3</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">People have rights</span>
                    <span className="text-gray-600"> - to see their data and ask for mistakes to be fixed</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">4</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Data retention limits</span>
                    <span className="text-gray-600"> - must not be kept longer than needed</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">5</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">No unauthorized sharing</span>
                    <span className="text-gray-600"> - sharing data without permission is not allowed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 Purpose</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                To protect people&apos;s privacy and stop misuse of personal information.
              </p>
            </div>
          </div>
        </div>
  
        {/* Computer Misuse Act 1990 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
              <span className="text-2xl">💻</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-red-700">Computer Misuse Act 1990</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">What the law prohibits:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">1</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Unauthorized access</span>
                    <span className="text-gray-600"> - accessing computer systems without permission (hacking)</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">2</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Malware creation and distribution</span>
                    <span className="text-gray-600"> - making, using, or spreading viruses or malware</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">3</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Unauthorized data modification</span>
                    <span className="text-gray-600"> - changing or deleting data without permission</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">4</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Data access violations</span>
                    <span className="text-gray-600"> - trying to access data you are not allowed to see</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">🎯 Purpose</h3>
              <p className="text-red-700 text-sm leading-relaxed">
                To stop hacking, spreading viruses, and other computer crimes.
              </p>
            </div>
          </div>
        </div>
  
        {/* Copyright Designs and Patents Act 1988 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <span className="text-2xl">©</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-700">Copyright, Designs and Patents Act 1988</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">What the law protects:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">1</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Creators&apos; rights</span>
                    <span className="text-gray-600"> - protects creators of music, videos, software, books, etc.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">2</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Unauthorized copying prohibited</span>
                    <span className="text-gray-600"> - illegal to copy, share, or download copyrighted work without permission</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">3</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Permission required</span>
                    <span className="text-gray-600"> - only the copyright owner can give permission to use their work</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">4</div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">Legal consequences</span>
                    <span className="text-gray-600"> - breaking copyright can lead to fines or legal action</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">🎯 Purpose</h3>
              <p className="text-purple-700 text-sm leading-relaxed">
                To protect people&apos;s work and make sure creators get credit and payment.
              </p>
            </div>
          </div>
        </div>
  
        {/* Software Licences */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700">Software Licences</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌱</span>
                <h3 className="font-semibold text-green-800 text-lg">Open Source</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-green-700 min-w-0"><span className="font-medium">Source code available</span> - to everyone</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-green-700 min-w-0"><span className="font-medium">Freedom to modify</span> - anyone can use, change, and share</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-green-700 min-w-0"><span className="font-medium">Usually free</span> to use</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-green-700 min-w-0"><span className="font-medium">Examples:</span> Linux, LibreOffice, GIMP</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-green-700 min-w-0"><span className="font-medium">Great for</span> learning and collaboration</span>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔒</span>
                <h3 className="font-semibold text-red-800 text-lg">Proprietary (Closed Source)</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-red-700 min-w-0"><span className="font-medium">Source code secret</span> - kept private</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-red-700 min-w-0"><span className="font-medium">Limited modification</span> - only the company can change it</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-red-700 min-w-0"><span className="font-medium">Usually paid</span> - not free</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-red-700 min-w-0"><span className="font-medium">Examples:</span> Microsoft Office, Windows, Adobe Photoshop</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-red-700 min-w-0"><span className="font-medium">Often comes as</span> &apos;off-the-shelf&apos; software</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🤔 Why do we need licences?</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Licences explain what you can and cannot do with software. They protect the creator and the user.
            </p>
          </div>
        </div>
  
        {/* Recommending a Licence */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg flex-shrink-0">
              <span className="text-2xl">🤔</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-yellow-700">Recommending a Licence</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">When to choose Open Source:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                  <span className="min-w-0">For learning and educational purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                  <span className="min-w-0">When you want others to help improve the software</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                  <span className="min-w-0">For sharing and collaboration</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">When to choose Proprietary:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1 flex-shrink-0">✓</span>
                  <span className="min-w-0">For making money and commercial use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1 flex-shrink-0">✓</span>
                  <span className="min-w-0">When you want to keep control of the code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1 flex-shrink-0">✓</span>
                  <span className="min-w-0">When you want to keep the code secret</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Exam Tip</h3>
            <p className="text-yellow-700 text-sm leading-relaxed">
              <strong>Always give a reason for your choice!</strong> For example: &quot;Open source is best for students because they
              can see and change the code to learn how it works.&quot;
            </p>
          </div>
        </div>
      </div>
    )
  }
  

export default ComputerScienceLawsGuide; 