


document.addEventListener("DOMContentLoaded", () => {
  
  const form = document.getElementById("loginForm");
  
  const error = document.getElementById("error");

  
  const params = new URLSearchParams(window.location.search);
  
  const redirect = params.get("redirect");

  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    
    
    const emailInput = document.getElementById("email").value.trim();
    
    const passwordInput = document.getElementById("password").value.trim();

    
    error.textContent = "";

    try {
      const loginUrl = window.location.origin.includes("localhost:8080") || window.location.origin.includes("127.0.0.1:8080")
        ? `${window.location.origin}/auth/login`
        : "http://localhost:8080/auth/login";
      
      
      
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        
        
        body: JSON.stringify({ 
          email: emailInput, 
          password: passwordInput 
        })
      });

      
      if (!res.ok) {
        
        const errorData = await res.json().catch(() => ({}));
        error.textContent = errorData.mensaje || "Pequeño cordero no encontrado";
        return;
      }

      
      const data = await res.json();

      
      if (data.ok || data.status === "success") {
        
        
        const role = String(data.rol || data.usuario?.rol || "").toLowerCase();

        localStorage.setItem("sportbook-authenticated", "true");
        localStorage.setItem("sportbook-user-email", emailInput);
        localStorage.setItem("sportbook-user-role", role);

        
        if (role === "admin") {
          window.location.href = "../Menú.html";
        } else {
          window.location.href = redirect === "ayuda" 
            ? "../Menú.html#ayuda" 
            : "../Menú.html";
        }
      } else {
        
        localStorage.removeItem("wikisingers-auth");
        localStorage.removeItem("sportbook-authenticated");
        localStorage.removeItem("user-email");
        localStorage.removeItem("sportbook-user-email");
        localStorage.removeItem("sportbook-user-role");
        error.textContent = data.mensaje || "Sacrificio no encontrado";
      }

    } catch (err) {
      
      console.error("Error en la petición:", err);
      localStorage.removeItem("wikisingers-auth");
      localStorage.removeItem("sportbook-authenticated");
      localStorage.removeItem("user-email");
      localStorage.removeItem("sportbook-user-email");
      localStorage.removeItem("sportbook-user-role");
      error.textContent = "Error del servidor";
    }
  });
});




