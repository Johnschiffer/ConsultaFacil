const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(cors());


// TESTE DO SERVIDOR

app.get("/", function(req, res) {
    res.send("ConsultaFácil funcionando!");
});


// LOGIN / CADASTRO

app.post("/api/auth", function(req, res) {

    const nome = req.body.nome;
    const email = req.body.email;

    if (!nome || !email) {
        return res.status(400).json({
            erro: "Nome e email são obrigatórios."
        });
    }

    db.get(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        function(erro, usuario) {

            if (erro) {
                return res.status(500).json({
                    erro: "Erro no banco de dados."
                });
            }

            if (usuario) {
                return res.json(usuario);
            }

            db.run(
                "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
                [nome, email],
                function(erro) {

                    if (erro) {
                        return res.status(500).json({
                            erro: "Erro ao cadastrar usuário."
                        });
                    }

                    res.json({
                        id: this.lastID,
                        nome: nome,
                        email: email
                    });
                }
            );
        }
    );
});

// HORARIOS
app.get("/api/horarios", function(req, res) {

    const medico = req.query.medico;
    const data = req.query.data;

    const horarios = ["08:00", "10:00", "14:00", "16:00"];

    db.all(
        `SELECT horario FROM agendamentos
         WHERE medico = ?
         AND data = ?
         AND status = 'Agendado'`,
        [medico, data],
        function(erro, consultas) {

            if (erro) {
                return res.status(500).json({
                    erro: "Erro ao buscar horários."
                });
            }

            const ocupados = consultas.map(function(consulta) {
                return consulta.horario;
            });

            const disponiveis = horarios.filter(function(horario) {
                return !ocupados.includes(horario);
            });

            res.json(disponiveis);
        }
    );
});

// CRIAR AGENDAMENTO

app.post("/api/agendamentos", function(req, res) {

    const usuario_id = req.body.usuario_id;
    const especialidade = req.body.especialidade;
    const medico = req.body.medico;
    const data = req.body.data;
    const horario = req.body.horario;

    if (!usuario_id || !especialidade || !medico || !data || !horario) {
        return res.status(400).json({
            erro: "Todos os campos são obrigatórios."
        });
    }

    // Verifica se o horário já está ocupado
    db.get(
        `SELECT * FROM agendamentos
         WHERE medico = ?
         AND data = ?
         AND horario = ?
         AND status = 'Agendado'`,
        [medico, data, horario],
        function(erro, consulta) {

            if (erro) {
                return res.status(500).json({
                    erro: "Erro ao verificar horário."
                });
            }

            if (consulta) {
                return res.status(400).json({
                    erro: "Este médico já possui uma consulta neste horário."
                });
            }

            // Salva a consulta
            db.run(
                `INSERT INTO agendamentos
                (usuario_id, especialidade, medico, data, horario)
                VALUES (?, ?, ?, ?, ?)`,
                [usuario_id, especialidade, medico, data, horario],
                function(erro) {

                    if (erro) {
                        return res.status(500).json({
                            erro: "Erro ao salvar agendamento."
                        });
                    }

                    res.json({
                        id: this.lastID,
                        mensagem: "Consulta agendada com sucesso."
                    });
                }
            );
        }
    );
});


// LISTAR CONSULTAS DO USUÁRIO

app.get("/api/agendamentos/:usuario_id", function(req, res) {

    const usuario_id = req.params.usuario_id;

    db.all(
        `SELECT *
         FROM agendamentos
         WHERE usuario_id = ?
         AND status = 'Agendado'
         ORDER BY data, horario`,
        [usuario_id],
        function(erro, consultas) {

            if (erro) {
                return res.status(500).json({
                    erro: "Erro ao buscar consultas."
                });
            }

            res.json(consultas);
        }
    );
});


// INICIAR SERVIDOR

app.listen(3000, function() {
    console.log("Servidor rodando em http://localhost:3000");
});