/*
====================================================
CANAIS
====================================================

COLOQUE AQUI OS LINKS DOS SEUS PLAYERS.

YouTube:
https://www.youtube.com/embed/ID

Vimeo:
https://player.vimeo.com/video/ID

Twitch:
https://player.twitch.tv/?channel=CANAL&parent=SEU_DOMINIO

====================================================
*/

const channels = [

    {
        name: "Judo World BR",
        platform: "YouTube",
        type: "Ao vivo",

        url:
        "https://www.youtube.com/embed/uZ0V4zbQ2W8?autoplay=1&mute=1&rel=0"
    },


    {
        name: "Tatame 2",
        platform: "YouTube",
        type: "Ao vivo",

        url:
        "https://www.youtube.com/embed/SEU_VIDEO_2"
    },


    {
        name: "Judo Live",
        platform: "Vimeo",
        type: "Ao vivo",

        url:
        "https://player.vimeo.com/video/SEU_VIDEO"
    },


    {
        name: "Judo Twitch",
        platform: "Twitch",
        type: "Ao vivo",

        url:
        "https://player.twitch.tv/?channel=SEU_CANAL&parent=judo-world-br.vercel.app"
    }

];


let currentChannel = 0;


/*
====================================================
CRIAR CANAIS
====================================================
*/

function renderChannels() {

    const list =
        document.getElementById(
            "channelList"
        );

    list.innerHTML = "";


    channels.forEach(
        (channel, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "channel" +
                (
                    index === currentChannel
                        ? " active"
                        : ""
                );


            element.onclick = () =>
                changeChannel(index);


            element.innerHTML = `

                <div class="number">
                    ${index + 1}
                </div>

                <div class="channel-text">

                    <div class="channel-name">
                        ${channel.name}
                    </div>

                    <div class="channel-platform">
                        ${channel.platform}
                        •
                        ${channel.type}
                    </div>

                </div>

            `;


            list.appendChild(
                element
            );

        }
    );
}


/*
====================================================
TROCAR CANAL
====================================================
*/

function changeChannel(index) {

    if (
        index < 0 ||
        index >= channels.length
    ) return;


    currentChannel = index;


    const channel =
        channels[currentChannel];


    document.getElementById(
        "player"
    ).src =
        channel.url;


    document.getElementById(
        "channelTitle"
    ).textContent =
        channel.name;


    document.getElementById(
        "platform"
    ).textContent =
        channel.platform +
        " • " +
        channel.type;


    renderChannels();
}


/*
====================================================
PRÓXIMO CANAL
====================================================
*/

function nextChannel() {

    currentChannel++;

    if (
        currentChannel >=
        channels.length
    ) {
        currentChannel = 0;
    }

    changeChannel(
        currentChannel
    );
}


/*
====================================================
CANAL ANTERIOR
====================================================
*/

function previousChannel() {

    currentChannel--;

    if (
        currentChannel < 0
    ) {
        currentChannel =
            channels.length - 1;
    }

    changeChannel(
        currentChannel
    );
}


/*
====================================================
TELA CHEIA
====================================================
*/

function fullscreen() {

    const screen =
        document.getElementById(
            "screen"
        );


    if (
        document.fullscreenElement
    ) {

        document.exitFullscreen();

    } else {

        screen.requestFullscreen();

    }
}


/*
====================================================
CONTROLE PELO TECLADO
====================================================

↑ = canal anterior
↓ = próximo canal
F = tela cheia
1-9 = canal específico
====================================================
*/

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowUp"
        ) {

            previousChannel();

        }


        if (
            event.key === "ArrowDown"
        ) {

            nextChannel();

        }


        if (
            event.key.toLowerCase()
            === "f"
        ) {

            fullscreen();

        }


        const number =
            parseInt(event.key);


        if (
            number >= 1 &&
            number <= 9
        ) {

            const index =
                number - 1;


            if (
                index <
                channels.length
            ) {

                changeChannel(
                    index
                );

            }

        }

    }
);


/*
====================================================
INICIALIZAÇÃO
====================================================
*/

renderChannels();
