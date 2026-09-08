const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    window.location.href = "index.html";
} else {
    document.getElementById("nome-usuario").textContent = "Olá, " + usuario.nome;
}


// MÉDICOS

const medicos = {
    "Clínica Geral": ["Dr. Roberto Silva", "Dra. Maria Fernanda"],
    "Cardiologia": ["Dr. Carlos Eduardo", "Dra. Patrícia Lima"],
    "Dermatologia": ["Dra. Juliana Mendes", "Dr. Lucas Castro"],
    "Pediatria": ["Dra. Vanessa Santos", "Dr. André Rocha"]
};


document.getElementById("especialidade").addEventListener("change", function() {

    const campoMedico = document.getElementById("medico");

    campoMedico.innerHTML = '<option value="">Selecione...</option>';

    if (this.value == "") {
        campoMedico.disabled = true;
        return;
    }

    campoMedico.disabled = false;

    medicos[this.value].forEach(function(medico) {

        campoMedico.innerHTML +=
            '<option value="' + medico + '">' + medico + '</option>';

    });
});

// CARREGAR HORARIOS

async function carregarHorarios() {

    const medico = document.getElementById("medico").value;
    const data = document.getElementById("data").value;
    const campoHorario = document.getElementById("horario");

    if (medico == "" || data == "") {
        campoHorario.disabled = true;
        return;
    }

    const resposta = await fetch(
        "http://localhost:3000/api/horarios?medico=" +
        encodeURIComponent(medico) +
        "&data=" +
        data
    );

    const horarios = await resposta.json();

    campoHorario.innerHTML = '<option value="">Selecione...</option>';

    horarios.forEach(function(horario) {
        campoHorario.innerHTML +=
            '<option value="' + horario + '">' + horario + '</option>';
    });

    campoHorario.disabled = false;
}

// CHAMAR QUANDO MUDAR MÉDICO OU DATA

document.getElementById("medico").addEventListener("change", carregarHorarios);
document.getElementById("data").addEventListener("change", carregarHorarios);

// AGENDAR CONSULTA

document.getElementById("form-agendamento").addEventListener("submit", async function(event) {

    event.preventDefault();

    const consulta = {
        usuario_id: usuario.id,
        especialidade: document.getElementById("especialidade").value,
        medico: document.getElementById("medico").value,
        data: document.getElementById("data").value,
        horario: document.getElementById("horario").value
    };

    const resposta = await fetch("http://localhost:3000/api/agendamentos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(consulta)
    });

    if (resposta.ok) {

        alert("Consulta agendada com sucesso!");

        this.reset();

        document.getElementById("medico").disabled = true;

    } else {

        alert("Erro ao agendar consulta.");

    }
});


// MOSTRAR CONSULTAS

async function mostrarConsultas() {

    const resposta = await fetch(
        "http://localhost:3000/api/agendamentos/" + usuario.id
    );

    const consultas = await resposta.json();

    const lista = document.getElementById("lista-consultas");

    lista.innerHTML = "";

    if (consultas.length == 0) {

        lista.innerHTML = "<p>Nenhuma consulta agendada.</p>";

        return;
    }

    consultas.forEach(function(consulta) {

        lista.innerHTML += `
            <div class="item-consulta">
                <h3>${consulta.especialidade}</h3>
                <p>Médico: ${consulta.medico}</p>
                <p>Data: ${consulta.data}</p>
                <p>Horário: ${consulta.horario}</p>
            </div>
        `;

    });
}


// ABAS

const botoes = document.querySelectorAll(".btn-aba");

botoes.forEach(function(botao) {

    botao.addEventListener("click", function() {

        document.getElementById("aba-agendar").hidden = true;
        document.getElementById("aba-consultas").hidden = true;

        const aba = this.getAttribute("data-aba");

        document.getElementById(aba).hidden = false;

        botoes.forEach(function(item) {
            item.classList.remove("active");
        });

        this.classList.add("active");

        if (aba == "aba-consultas") {
            mostrarConsultas();
        }

    });
});


// LOGOUT

document.getElementById("btn-logout").addEventListener("click", function() {

    localStorage.removeItem("usuario");

    window.location.href = "index.html";

});