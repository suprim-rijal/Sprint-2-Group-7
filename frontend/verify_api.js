// Use native global fetch
async function runTests() {
  console.log("=== STARTING BACKEND API INTEGRATION TESTS ===");
  const baseUrl = "http://localhost:5000";

  try {
    // 1. Signup Check
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sarah Test",
        email: "sarahtest@example.com",
        password: "password123",
        role: "parent"
      })
    });
    const signupData = await signupRes.json();
    console.log("Signup Response code:", signupRes.status);
    console.log("Signup Data:", signupData);

    if (signupRes.status !== 201 && signupRes.status !== 200) {
      if (signupData.error !== "Email already registered" && signupData.error !== "User already exists") {
        throw new Error("Signup failed!");
      } else {
        console.log("Signup Note: User already registered/exists.");
      }
    }

    // 2. Login Check
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sarahtest@example.com",
        password: "password123"
      })
    });
    const loginData = await loginRes.json();
    console.log("Login Response code:", loginRes.status);
    console.log("Login User Object:", loginData.user ? "Success" : "Failed");
    if (loginRes.status !== 200) throw new Error("Login failed!");

    // 3. Contact Form Submission Check
    const contactRes = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sarah Test",
        email: "sarahtest@example.com",
        subject: "Query about Twi audio",
        message: "Audio pronunciation is playing perfectly. Support is excellent."
      })
    });
    const contactData = await contactRes.json();
    console.log("Contact Post Response code:", contactRes.status);
    console.log("Contact Post Data:", contactData);
    if (contactRes.status !== 200 && contactRes.status !== 201) throw new Error("Contact submission failed!");

    // 4. Admin Queries Retrieval Check
    const adminRes = await fetch(`${baseUrl}/api/contact/messages`);
    const adminData = await adminRes.json();
    console.log("Admin Messages Get Response code:", adminRes.status);
    console.log("Admin Messages list length:", adminData.messages ? adminData.messages.length : 0);
    
    if (adminRes.status !== 200) throw new Error("Admin query retrieval failed!");

    console.log("\n=== ALL BACKEND API ENDPOINTS VERIFIED OK SUCCESSFULLY ===");
  } catch (e) {
    console.error("API Verification Test FAILED:", e);
    process.exit(1);
  }
}

runTests();
