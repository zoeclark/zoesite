document.addEventListener("DOMContentLoaded", () => {
  const poemPath = "mypoems/poem1.html";  // or update path if needed
  const container = document.getElementById("poems");

  if (!container) {
    console.error("❌ Element with id='poems' not found");
    return;
  }

  fetch(poemPath)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then(html => {
      const wrapper = document.createElement("div");
      wrapper.className = "poem";
      wrapper.innerHTML = html;
      container.appendChild(wrapper);
    })
    .catch(err => {
      console.error("Poem load error:", err);
      container.innerHTML = "<p style='color:red'>Failed to load poem.</p>";
    });
});
