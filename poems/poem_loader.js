document.addEventListener("DOMContentLoaded", () => {
  const poemPath = "mypoems/poem1.html";  // path to the poem
  const container = document.getElementById("poems");

  fetch(poemPath)
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement("div");
      wrapper.className = "poem";
      wrapper.innerHTML = html;
      container.appendChild(wrapper);
    })
    .catch(err => {
      container.innerHTML = "<p style='color:red'>Failed to load poem.</p>";
      console.error("Poem load error:", err);
    });
});
