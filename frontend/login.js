const form = document.getElementById("form-auth");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nome = document.getElementById("auth-nome").value;
    const email = document.getElementById("auth-email").value;

    const resposta = await fetch("http://localhost:3000/api/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: nome,
            email: email
        })
    });

    const usuario = await resposta.json();

    localStorage.setItem("usuario", JSON.stringify(usuario));

    window.location.href = "painel.html";
});