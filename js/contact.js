// Use another MockAPI resource for messages (create one in MockAPI dashboard)
const contactApiUrl = "https://68e010a393207c4b479399ed.mockapi.io/messages";

const form = document.getElementById("contactForm");
const statusMsg = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const title = document.getElementById("title").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!email || !title || !message) {
    statusMsg.textContent = "⚠️ Please fill in all fields.";
    statusMsg.style.color = "red";
    return;
  }

  const newMessage = { email, title, message };

  try {
    const res = await fetch(contactApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage)
    });

    if (res.ok) {
      statusMsg.textContent = "✅ Message sent successfully!";
      statusMsg.style.color = "green";
      form.reset();
    } else {
      throw new Error("Failed to send message");
    }
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Error sending message. Try again.";
    statusMsg.style.color = "red";
  }
});
