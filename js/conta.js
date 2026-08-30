/* =====================================================
   SUPABASE
===================================================== */

if (!window.supabase || !window.supabaseClient) {

    console.error(
        "Supabase não foi configurado corretamente."
    );

}


/* =====================================================
   ELEMENTOS
===================================================== */

const loginCard =
    document.getElementById("loginCard");

const profileCard =
    document.getElementById("profileCard");

const loginForm =
    document.getElementById("loginForm");

const logoutButton =
    document.getElementById("logoutButton");

const googleButton =
    document.getElementById("googleButton");

const themeButton =
    document.getElementById("themeButton");


/* =====================================================
   TEMA
===================================================== */

const temaSalvo =
    localStorage.getItem("tema");

if (temaSalvo === "escuro") {

    document.body.classList.add("dark");

    if (themeButton) {
        themeButton.textContent = "☀️";
    }

} else {

    if (themeButton) {
        themeButton.textContent = "🌙";
    }

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle("dark");

            const escuro =
                document.body.classList.contains("dark");

            if (escuro) {

                themeButton.textContent = "☀️";

                localStorage.setItem(
                    "tema",
                    "escuro"
                );

            } else {

                themeButton.textContent = "🌙";

                localStorage.setItem(
                    "tema",
                    "claro"
                );

            }

        }
    );

}


/* =====================================================
   MOSTRAR PERFIL
===================================================== */

async function mostrarPerfil(user) {

    if (!user) return;


    /* -------------------------------------------------
       Buscar dados do usuário
    ------------------------------------------------- */

    const { data: usuario, error } =
        await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(
            "Erro ao buscar usuário:",
            error
        );

        return;
    }


    /* -------------------------------------------------
       Esconde login
    ------------------------------------------------- */

    if (loginCard) {
        loginCard.style.display = "none";
    }


    /* -------------------------------------------------
       Mostra perfil
    ------------------------------------------------- */

    if (profileCard) {
        profileCard.style.display = "block";
    }


    /* -------------------------------------------------
       Nome
    ------------------------------------------------- */

    const nome =
        usuario.nome || "Usuário";

    document.getElementById(
        "profileName"
    ).textContent = nome;

    document.getElementById(
        "profileNameInfo"
    ).textContent = nome;


    /* -------------------------------------------------
       E-mail
    ------------------------------------------------- */

    document.getElementById(
        "profileEmail"
    ).textContent =
        usuario.email || user.email || "-";


    /* -------------------------------------------------
       Telefone
    ------------------------------------------------- */

    const telefone =
        usuario.telefone || "-";

    document.getElementById(
        "profileTelefone"
    ).textContent = telefone;


    /* -------------------------------------------------
       Tipo
    ------------------------------------------------- */

    const tipo =
        usuario.tipo || "aluno";

    document.getElementById(
        "profileTipo"
    ).textContent =
        tipo === "vendedor"
            ? "Vendedor"
            : "Aluno";


    /* -------------------------------------------------
       FAIXA
    ------------------------------------------------- */

    const faixaBox =
        document.getElementById(
            "profileFaixaBox"
        );

    if (tipo === "aluno") {

        faixaBox.style.display = "flex";

        document.getElementById(
            "profileFaixa"
        ).textContent =
            usuario.faixa || "Não informado";

    } else {

        faixaBox.style.display = "none";

    }


    /* -------------------------------------------------
       LOJA
    ------------------------------------------------- */

    const lojaBox =
        document.getElementById(
            "profileLojaBox"
        );


    if (tipo === "vendedor") {

        const { data: loja } =
            await supabaseClient
                .from("lojas")
                .select("*")
                .eq("vendedor_id", user.id)
                .maybeSingle();


        if (loja) {

            lojaBox.style.display = "flex";

            document.getElementById(
                "profileLoja"
            ).textContent =
                loja.nome;

        } else {

            lojaBox.style.display = "none";

        }

    } else {

        lojaBox.style.display = "none";

    }


    /* -------------------------------------------------
       Texto principal
    ------------------------------------------------- */

    const subtitle =
        document.getElementById(
            "accountSubtitle"
        );

    if (subtitle) {

        subtitle.textContent =
            "Bem-vindo à sua conta.";

    }

}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const senha =
                document
                    .getElementById("password")
                    .value;


            if (!email || !senha) {

                alert(
                    "Digite seu e-mail e sua senha."
                );

                return;
            }


            const button =
                document.getElementById(
                    "loginButton"
                );


            button.disabled = true;

            button.textContent =
                "Entrando...";


            try {

                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({

                        email: email,

                        password: senha

                    });


                if (error) {

                    console.error(error);

                    alert(
                        "E-mail ou senha incorretos."
                    );

                    return;
                }


                if (!data.user) {

                    alert(
                        "Não foi possível entrar."
                    );

                    return;
                }


                await mostrarPerfil(
                    data.user
                );


            } catch (error) {

                console.error(error);

                alert(
                    "Erro ao tentar entrar."
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    "Entrar";

            }

        }
    );

}


/* =====================================================
   GOOGLE
===================================================== */

if (googleButton) {

    googleButton.addEventListener(
        "click",
        async function () {

            try {

                const { error } =
                    await supabaseClient.auth.signInWithOAuth({

                        provider: "google",

                        options: {
                            redirectTo:
                                window.location.href
                        }

                    });


                if (error) {

                    console.error(error);

                    alert(
                        "Não foi possível entrar com Google."
                    );

                }

            } catch (error) {

                console.error(error);

                alert(
                    "Erro ao conectar com Google."
                );

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                const { error } =
                    await supabaseClient.auth.signOut();


                if (error) {

                    console.error(error);

                }


                window.location.reload();


            } catch (error) {

                console.error(error);

                window.location.reload();

            }

        }
    );

}


/* =====================================================
   ESQUECI A SENHA
===================================================== */

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            if (!email) {

                alert(
                    "Digite seu e-mail primeiro."
                );

                return;
            }


            try {

                const { error } =
                    await supabaseClient.auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    window.location.origin +
                                    "/conta.html"
                            }
                        );


                if (error) {

                    console.error(error);

                    alert(
                        "Não foi possível enviar o e-mail."
                    );

                    return;
                }


                alert(
                    "Enviamos um link para redefinir sua senha."
                );


            } catch (error) {

                console.error(error);

                alert(
                    "Erro ao solicitar redefinição."
                );

            }

        }
    );

}


/* =====================================================
   VERIFICAR USUÁRIO LOGADO
===================================================== */

async function verificarUsuario() {

    try {

        const { data, error } =
            await supabaseClient.auth.getUser();


        if (error) {

            console.log(
                "Nenhum usuário logado."
            );

            return;
        }


        if (data && data.user) {

            await mostrarPerfil(
                data.user
            );

        }

    } catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

    }

}


/* =====================================================
   INICIAR
===================================================== */

verificarUsuario();