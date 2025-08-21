export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Welcome to Healthcare App
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Manage your health from one place. Schedule appointments, track medications, and monitor your well-being with our comprehensive healthcare platform.
      </p>
      <div className="flex gap-4">
        <a
          href="/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          Sign In
        </a>
      </div>
      
      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Easy Scheduling</h2>
          <p className="text-gray-600">Book appointments with your healthcare providers quickly and easily.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Health Tracking</h2>
          <p className="text-gray-600">Monitor your medications, symptoms, and overall well-being in one place.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h2>
          <p className="text-gray-600">Your health information is protected with industry-standard security measures.</p>
        </div>
      </div>
    </div>
  );
}
