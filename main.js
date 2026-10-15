const msg = document.getElementById("game_msg");

let w_s_c_right = true;
let w_l_c_right = true;
let b_s_c_right = true;
let b_l_c_right = true;

let whiteTurn = false; // I'm keeping it false because when the update is called it gets flipped to true

let attacked_Squares = [];

let last_move = {};

const square = Array.from(document.getElementsByClassName("square"));

let pieces = [
    "Pieces/rook-black.svg", "Pieces/knight-black.svg", "Pieces/bishop-black.svg", "Pieces/queen-black.svg", "Pieces/king-black.svg", "Pieces/bishop-black.svg", "Pieces/knight-black.svg", "Pieces/rook-black.svg",
    "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg",
    "Pieces/rook-white.svg", "Pieces/knight-white.svg", "Pieces/bishop-white.svg", "Pieces/queen-white.svg", "Pieces/king-white.svg", "Pieces/bishop-white.svg", "Pieces/knight-white.svg", "Pieces/rook-white.svg"
];

function removeClass() {
    document.querySelector(".selected")?.classList.remove("selected");
    document.querySelectorAll(".highlight, .enPassant, .short_castle, .long_castle").forEach(h => {
        h.classList.remove("highlight", "enPassant", "short_castle", "long_castle");
    });
}

let lastPosition = [];

const storedMoves = [];

function storeMoves(object) {
    const lastMove = [object.piece, object.color, object.from, object.to];
    storedMoves.push(lastMove);
}

function render() {

    document.querySelector(".check")?.classList.remove("check");

    square.forEach((s, i) => {
        s.innerHTML = "";

        if (pieces[i] !== "") {
            let img = document.createElement("img");
            img.src = pieces[i];
            img.classList.add("piece");
            s.appendChild(img);
        }
    });
}

function update() {

    if (isLegalPos(pieces, !whiteTurn)) {

        checkPromotion();
        white_castle_update();
        black_castle_update();

        whiteTurn = !whiteTurn;

        attacked_Squares = attackedSquares(pieces, whiteTurn);
    }

    else {

        pieces = [...lastPosition];

        storedMoves.pop();

        const prev = storedMoves[storedMoves.length - 1];

        last_move = prev ? { piece: prev[0], color: prev[1], from: prev[2], to: prev[3] } : {};
    }

    render();

    if (isCheck()) {
        let color = whiteTurn ? "white" : "black";
        square[pieces.indexOf(`Pieces/king-${color}.svg`)].classList.add("check");
    }

    checkGameOver();

    msg.innerText = `${whiteTurn?"WHITE":"BLACK"}'s turn to move!`

    point_counter();
}

update();

square.forEach((s, i) => {

    s.addEventListener("click", () => {

        lastPosition = [...pieces];

        const selected = document.querySelector(".selected");

        if (selected) {

            if (s !== selected) {

                if (s.classList.contains("highlight")) {

                    if (s.innerHTML !== "") {

                        if ((s.querySelector("img").getAttribute("src").includes("white") && selected.querySelector("img")?.getAttribute("src").includes("white")) || (s.querySelector("img").getAttribute("src").includes("black") && selected.querySelector("img")?.getAttribute("src").includes("black"))) {

                            removeClass();
                        }

                        else {
                            pieces[i] = selected.querySelector("img").getAttribute("src");

                            pieces[square.indexOf(selected)] = "";

                            last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
                            last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
                            last_move.from = square.indexOf(selected);
                            last_move.to = i;
                            storeMoves(last_move);

                            removeClass();

                            update();
                        }
                    }

                    else {

                        if (s.classList.contains("enPassant")) {

                            if (selected.querySelector("img").getAttribute("src").includes("white")) {

                                pieces[i + 8] = "";

                                pieces[square.indexOf(selected)] = "";

                                pieces[i] = selected.querySelector("img").getAttribute("src");

                                last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
                                last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
                                last_move.from = square.indexOf(selected);
                                last_move.to = i;

                                storeMoves(last_move);

                                removeClass();

                                update();
                            }

                            else {

                                pieces[i - 8] = "";

                                pieces[square.indexOf(selected)] = "";

                                pieces[i] = selected.querySelector("img").getAttribute("src");

                                last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
                                last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
                                last_move.from = square.indexOf(selected);
                                last_move.to = i;
                                storeMoves(last_move);

                                removeClass();

                                update();
                            }
                        }

                        else if (s.classList.contains("short_castle")) {

                            pieces[i] = pieces[i - 2];

                            pieces[i - 1] = pieces[i + 1];

                            pieces[i - 2] = "";

                            pieces[i + 1] = "";

                            last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
                            last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
                            last_move.from = square.indexOf(selected);
                            last_move.to = i;

                            storeMoves(last_move);

                            removeClass();

                            update();
                        }

                        else if (s.classList.contains("long_castle")) {

                            pieces[i] = pieces[i + 2];

                            pieces[i + 1] = pieces[i - 2];

                            pieces[i + 2] = "";

                            pieces[i - 2] = "";

                            last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
                            last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
                            last_move.from = square.indexOf(selected);
                            last_move.to = i;

                            storeMoves(last_move);

                            removeClass();

                            update();
                        }

                        else {

                            pieces[square.indexOf(selected)] = "";

                            pieces[i] = selected.querySelector("img").getAttribute("src");

                            last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
                            last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
                            last_move.from = square.indexOf(selected);
                            last_move.to = i;
                            storeMoves(last_move);

                            removeClass();

                            update();
                        }
                    }
                }
                else {
                    removeClass();
                    s.click();
                }
            }

            else {
                removeClass();
            }
        }

        else {

            if (s.innerHTML !== "") {
                if (whiteTurn && s.querySelector("img").getAttribute("src").includes("white")) {
                    s.classList.add("selected");
                }

                else if (!whiteTurn && !s.querySelector("img").getAttribute("src").includes("white")) {
                    s.classList.add("selected");
                }

                let isWhite = s.querySelector("img").getAttribute("src").includes("white");
                let isKnight = s.querySelector("img").getAttribute("src").includes("knight");
                let isBishop = s.querySelector("img").getAttribute("src").includes("bishop");
                let isRook = s.querySelector("img").getAttribute("src").includes("rook");
                let isQueen = s.querySelector("img").getAttribute("src").includes("queen");
                let isKing = s.querySelector("img").getAttribute("src").includes("king");
                let isPawn = s.querySelector("img").getAttribute("src").includes("pawn");


                if (isKnight) {

                    let move = knight_move(i);

                    if (whiteTurn && isWhite) {

                        for (let j = 0; j < move.length; j++) {
                            square[move[j]].classList.add("highlight");
                        }

                        document.querySelectorAll(".highlight").forEach(y => {
                            if (y.querySelector("img")?.getAttribute("src").includes("white")) {
                                y.classList.remove("highlight");
                            }
                        })
                    }

                    else if (!whiteTurn && !isWhite) {

                        for (let j = 0; j < move.length; j++) {
                            square[move[j]].classList.add("highlight");

                            if (s.querySelector("img").getAttribute("src").includes("black")) {
                                s.classList.remove("highlight");
                            }
                        }

                        document.querySelectorAll(".highlight").forEach(y => {

                            if (y.querySelector("img")?.getAttribute("src").includes("black")) {
                                y.classList.remove("highlight");
                            }
                        })
                    }
                }

                else if (isBishop) {

                    let move = bishop_move(i);

                    if (whiteTurn && isWhite) {

                        for (let j = 0; j < 4; j++) {

                            for (let k = 0; k < move[j].length; k++) {

                                let c = square[move[j][k]]

                                if (c.innerHTML !== "") {

                                    if (c.querySelector("img").getAttribute("src").includes("white")) {
                                        break;
                                    }

                                    else {
                                        c.classList.add("highlight");
                                        break;
                                    }

                                }

                                else {
                                    c.classList.add("highlight");
                                }
                            }
                        }
                    }

                    else if (!whiteTurn && !isWhite) {

                        for (let j = 0; j < 4; j++) {

                            for (let k = 0; k < move[j].length; k++) {

                                let c = square[move[j][k]]

                                if (c.innerHTML !== "") {

                                    if (c.querySelector("img").getAttribute("src").includes("black")) {
                                        break;
                                    }

                                    else {
                                        c.classList.add("highlight");
                                        break;
                                    }
                                }

                                else {
                                    c.classList.add("highlight");
                                }
                            }
                        }
                    }
                }

                else if (isRook) {

                    let move = rook_move(i);

                    if (whiteTurn && isWhite) {

                        for (let j = 0; j < 4; j++) {

                            for (let k = 0; k < move[j].length; k++) {

                                let c = square[move[j][k]]

                                if (c.innerHTML !== "") {

                                    if (c.querySelector("img").getAttribute("src").includes("white")) {
                                        break;
                                    }

                                    else {
                                        c.classList.add("highlight");
                                        break;
                                    }

                                }

                                else {
                                    c.classList.add("highlight");
                                }
                            }
                        }
                    }

                    else if (!whiteTurn && !isWhite) {

                        for (let j = 0; j < 4; j++) {

                            for (let k = 0; k < move[j].length; k++) {

                                let c = square[move[j][k]]

                                if (c.innerHTML !== "") {

                                    if (c.querySelector("img").getAttribute("src").includes("black")) {
                                        break;
                                    }

                                    else {
                                        c.classList.add("highlight");
                                        break;
                                    }
                                }

                                else {
                                    c.classList.add("highlight");
                                }
                            }
                        }
                    }
                }

                else if (isQueen) {

                    let move = queen_move(i);

                    if (whiteTurn && isWhite) {

                        for (let j = 0; j < 8; j++) {

                            for (let k = 0; k < move[j].length; k++) {

                                let c = square[move[j][k]]

                                if (c.innerHTML !== "") {

                                    if (c.querySelector("img").getAttribute("src").includes("white")) {
                                        break;
                                    }

                                    else {
                                        c.classList.add("highlight");
                                        break;
                                    }

                                }

                                else {
                                    c.classList.add("highlight");
                                }
                            }
                        }
                    }

                    else if (!whiteTurn && !isWhite) {

                        for (let j = 0; j < 8; j++) {

                            for (let k = 0; k < move[j].length; k++) {

                                let c = square[move[j][k]]

                                if (c.innerHTML !== "") {

                                    if (c.querySelector("img").getAttribute("src").includes("black")) {
                                        break;
                                    }

                                    else {
                                        c.classList.add("highlight");
                                        break;
                                    }
                                }

                                else {
                                    c.classList.add("highlight");
                                }
                            }
                        }
                    }
                }

                else if (isKing) {

                    let move = king_move(i);

                    if (whiteTurn && isWhite) {

                        for (let j = 0; j < move.length; j++) {

                            let c = square[move[j]]

                            if (c.innerHTML !== "") {

                                if (c.querySelector("img").getAttribute("src").includes("white")) {
                                    continue;
                                }

                                else {
                                    c.classList.add("highlight");
                                    continue;
                                }

                            }

                            else {
                                c.classList.add("highlight");
                            }
                        }

                        if (pieces[61] === "" && pieces[62] === "" && w_s_c_right && !isCheck() && !attacked_Squares.includes(61) && !attacked_Squares.includes(62)) {
                            square[62].classList.add("highlight");
                            square[62].classList.add("short_castle");
                        }

                        if (pieces[59] === "" && pieces[58] === "" && pieces[57] === "" && w_l_c_right && !isCheck() && !attacked_Squares.includes(58) && !attacked_Squares.includes(59)) {
                            square[58].classList.add("highlight");
                            square[58].classList.add("long_castle");
                        }
                    }

                    else if (!whiteTurn && !isWhite) {

                        for (let j = 0; j < move.length; j++) {

                            let c = square[move[j]]

                            if (c.innerHTML !== "") {

                                if (c.querySelector("img").getAttribute("src").includes("black")) {
                                    continue;
                                }

                                else {
                                    c.classList.add("highlight");
                                    continue;
                                }

                            }

                            else {
                                c.classList.add("highlight");
                            }
                        }
                        if (pieces[5] === "" && pieces[6] === "" && b_s_c_right && !isCheck() && !attacked_Squares.includes(5) && !attacked_Squares.includes(6)) {
                            square[6].classList.add("highlight");
                            square[6].classList.add("short_castle");
                        }

                        if (pieces[3] === "" && pieces[2] === "" && pieces[1] === "" && b_l_c_right && !isCheck() && !attacked_Squares.includes(2) && !attacked_Squares.includes(3)) {
                            square[2].classList.add("highlight");
                            square[2].classList.add("long_castle");
                        }
                    }
                }

                else if (isPawn) {

                    if (whiteTurn && isWhite) {

                        let move = white_pawn_move(i);

                        for (let k = 0; k < move[0].length; k++) {

                            let c = square[move[0][k]]

                            if (c.innerHTML !== "") {
                                break;
                            }

                            else {
                                c.classList.add("highlight");
                            }
                        }

                        for (let k = 0; k < move[1].length; k++) {

                            let c = square[move[1][k]]

                            if (c.innerHTML !== "") {

                                if (c.querySelector("img").getAttribute("src").includes("white")) {
                                    continue;
                                }

                                else {
                                    c.classList.add("highlight");
                                    continue;
                                }
                            }

                            else {
                                continue;
                            }
                        }

                        if (is_white_en_passant(i)) {
                            square[last_move.from + 8].classList.add("highlight");
                            square[last_move.from + 8].classList.add("enPassant");
                        }
                    }

                    else if (!whiteTurn && !isWhite) {

                        let move = black_pawn_move(i);

                        for (let k = 0; k < move[0].length; k++) {

                            let c = square[move[0][k]]

                            if (c.innerHTML !== "") {
                                break;
                            }

                            else {
                                c.classList.add("highlight");
                            }
                        }

                        for (let k = 0; k < move[1].length; k++) {

                            let c = square[move[1][k]]

                            if (c.innerHTML !== "") {

                                if (c.querySelector("img").getAttribute("src").includes("black")) {
                                    continue;
                                }

                                else {
                                    c.classList.add("highlight");
                                    continue;
                                }
                            }

                            else {
                                continue;
                            }
                        }
                        if (is_black_en_passant(i)) {
                            square[last_move.from - 8].classList.add("highlight");
                            square[last_move.from - 8].classList.add("enPassant");
                        }
                    }
                }
            }

            removeIllegalHighlights();

        }
    })
});

function removeIllegalHighlights() {

    let tempPos = [...pieces];

    document.querySelectorAll(".highlight").forEach(h => {

        let to = square.indexOf(h);

        let from = square.indexOf(document.querySelector(".selected"));

        if (h.classList.contains("enPassant")) {

            tempPos[to] = tempPos[from];

            tempPos[from] = "";

            if (whiteTurn) {
                tempPos[to + 8] = "";
            }

            else {
                tempPos[to - 8] = "";
            }
        }

        else {

            tempPos[to] = tempPos[from];

            tempPos[from] = "";

        }

        if (!isLegalPos(tempPos, !whiteTurn)) {
            h.classList.remove("highlight", "enPassant");
        }

        tempPos = [...pieces];

    })

}

function knight_move(index) {

    let row = Math.floor(index / 8) + 1;
    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }

    let pmove = [];
    let prow;
    let pcol;
    let pindex;

    if (row > 2 && col > 1) {
        prow = row - 2;
        pcol = col - 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row > 2 && col < 8) {
        prow = row - 2;
        pcol = col + 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row > 1 && col > 2) {
        prow = row - 1;
        pcol = col - 2;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row > 1 && col < 7) {
        prow = row - 1;
        pcol = col + 2;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 8 && col > 2) {
        prow = row + 1;
        pcol = col - 2;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 8 && col < 7) {
        prow = row + 1;
        pcol = col + 2;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 7 && col > 1) {
        prow = row + 2;
        pcol = col - 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 7 && col < 8) {
        prow = row + 2;
        pcol = col + 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    return pmove;
}

function bishop_move(index) {

    let row = Math.floor(index / 8) + 1;
    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }

    let prow;
    let pcol;
    let pindex;
    let pmove = [
        [],
        [],
        [],
        []
    ]

    for (let i = 1; i < Math.min(row, col); i++) {
        prow = row - i;
        pcol = col - i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[0].push(pindex)
    }

    for (let i = 1; i < Math.min(row, 9 - col); i++) {
        prow = row - i;
        pcol = col + i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[1].push(pindex)
    }

    for (let i = 1; i < Math.min(col, 9 - row); i++) {
        prow = row + i;
        pcol = col - i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[2].push(pindex)
    }

    for (let i = 1; i < Math.min(9 - row, 9 - col); i++) {
        prow = row + i;
        pcol = col + i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[3].push(pindex)
    }

    return pmove;
}

function rook_move(index) {

    let row = Math.floor(index / 8) + 1;
    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }

    let prow;
    let pcol;
    let pindex;
    let pmove = [
        [],
        [],
        [],
        []
    ]

    for (let i = 1; i < row; i++) {
        prow = row - i;
        pcol = col;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[0].push(pindex)
    }

    for (let i = 1; i < col; i++) {
        prow = row;
        pcol = col - i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[1].push(pindex)
    }

    for (let i = 1; i < 9 - col; i++) {
        prow = row;
        pcol = col + i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[2].push(pindex)
    }

    for (let i = 1; i < 9 - row; i++) {
        prow = row + i;
        pcol = col;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[3].push(pindex)
    }

    return pmove;
}

function queen_move(index) {

    let row = Math.floor(index / 8) + 1;
    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }

    let prow;
    let pcol;
    let pindex;
    let pmove = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

    for (let i = 1; i < Math.min(row, col); i++) {
        prow = row - i;
        pcol = col - i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[0].push(pindex)
    }

    for (let i = 1; i < Math.min(row, 9 - col); i++) {
        prow = row - i;
        pcol = col + i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[1].push(pindex)
    }

    for (let i = 1; i < Math.min(col, 9 - row); i++) {
        prow = row + i;
        pcol = col - i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[2].push(pindex)
    }

    for (let i = 1; i < Math.min(9 - row, 9 - col); i++) {
        prow = row + i;
        pcol = col + i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[3].push(pindex)
    }

    for (let i = 1; i < row; i++) {
        prow = row - i;
        pcol = col;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[4].push(pindex)
    }

    for (let i = 1; i < col; i++) {
        prow = row;
        pcol = col - i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[5].push(pindex)
    }

    for (let i = 1; i < 9 - col; i++) {
        prow = row;
        pcol = col + i;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[6].push(pindex)
    }

    for (let i = 1; i < 9 - row; i++) {
        prow = row + i;
        pcol = col;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove[7].push(pindex)
    }

    return pmove;
}

function king_move(index) {

    let row = Math.floor(index / 8) + 1;
    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }

    let prow;
    let pcol;
    let pindex;
    let pmove = [

    ];

    if (row > 1 && col > 1) {
        prow = row - 1;
        pcol = col - 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row > 1) {
        prow = row - 1;
        pcol = col;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row > 1 && col < 8) {
        prow = row - 1;
        pcol = col + 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (col > 1) {
        prow = row;
        pcol = col - 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (col < 8) {
        prow = row;
        pcol = col + 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 8 && col > 1) {
        prow = row + 1;
        pcol = col - 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 8) {
        prow = row + 1;
        pcol = col;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    if (row < 8 && col < 8) {
        prow = row + 1;
        pcol = col + 1;
        pindex = (prow - 1) * 8 + (pcol - 1);
        pmove.push(pindex);
    }

    return pmove;
}

function white_pawn_move(index) {

    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }
    let pindex = [
        [],
        []
    ];

    const w_start_index = [48, 49, 50, 51, 52, 53, 54, 55];

    if (w_start_index.includes(index)) {
        pindex[0].push(index - 8, index - 16);
    }

    else {
        pindex[0].push(index - 8);
    }

    if (col == 1) {
        pindex[1].push(index - 7);
    }
    else if (col == 8) {
        pindex[1].push(index - 9)
    }
    else {
        pindex[1].push(index - 9, index - 7);
    }

    return pindex;
}

function black_pawn_move(index) {

    let col = (index + 1) % 8;

    if (col === 0) {
        col = 8;
    }
    let pindex = [
        [],
        []
    ];

    const b_start_index = [8, 9, 10, 11, 12, 13, 14, 15];

    if (b_start_index.includes(index)) {
        pindex[0].push(index + 8, index + 16);
    }

    else {
        pindex[0].push(index + 8);
    }

    if (col == 1) {
        pindex[1].push(index + 9);
    }

    else if (col == 8) {
        pindex[1].push(index + 7)
    }
    else {
        pindex[1].push(index + 7, index + 9);
    }

    return pindex;
}

function checkPromotion() {
    pieces.forEach((p, i) => {
        if (p.includes("pawn")) {
            if (p.includes("white") && [0, 1, 2, 3, 4, 5, 6, 7].includes(i)) {
                do {
                    do {
                        var promotion = prompt("Enter: q for Queen, r for Rook, b for Bishop or n for knight...")
                    } while (promotion == null);
                } while (!["q", "r", "b", "n"].includes(promotion.toLowerCase()));

                if (promotion.toLowerCase() == "q") {
                    pieces[i] = "Pieces/queen-white.svg";
                }

                else if (promotion.toLowerCase() == "r") {
                    pieces[i] = "Pieces/rook-white.svg";
                }

                else if (promotion.toLowerCase() == "b") {
                    pieces[i] = "Pieces/bishop-white.svg";
                }

                else {
                    pieces[i] = "Pieces/knight-white.svg";
                }
            }

            else if (p.includes("black") && [56, 57, 58, 59, 60, 61, 62, 63].includes(i)) {
                do {
                    do {
                        var promotion = prompt("Enter: q for Queen, r for Rook, b for Bishop or n for knight...")
                    } while (promotion == null);
                } while (!["q", "r", "b", "n"].includes(promotion.toLowerCase()));

                if (promotion.toLowerCase() == "q") {
                    pieces[i] = "Pieces/queen-black.svg";
                }

                else if (promotion.toLowerCase() == "r") {
                    pieces[i] = "Pieces/rook-black.svg";
                }

                else if (promotion.toLowerCase() == "b") {
                    pieces[i] = "Pieces/bishop-black.svg";
                }

                else {
                    pieces[i] = "Pieces/knight-black.svg";
                }
            }
        }
    })
}

function is_white_en_passant(index) {

    if ([24, 25, 26, 27, 28, 29, 30, 31].includes(index) && last_move.piece == "pawn" && last_move.color == "black" && [8, 9, 10, 11, 12, 13, 14, 15].includes(last_move.from) && [24, 25, 26, 27, 28, 29, 30, 31].includes(last_move.to)) {

        let col = (index + 1) % 8;

        if (col == 0) {
            col = 8;
        }

        if ((col == 1 && last_move.from == 9) || (col == 8 && last_move.from == 14) || (col < 8 && col > 1 && [index - 17, index - 15].includes(last_move.from))) {
            return true;
        }

        else {
            return false;
        }
    }
}

function is_black_en_passant(index) {

    if ([32, 33, 34, 35, 36, 37, 38, 39].includes(index) && last_move.piece == "pawn" && last_move.color == "white" && [48, 49, 50, 51, 52, 53, 54, 55].includes(last_move.from) && [32, 33, 34, 35, 36, 37, 38, 39].includes(last_move.to)) {

        let col = (index + 1) % 8;

        if (col == 0) {
            col = 8;
        }

        if ((col == 1 && last_move.from == 49) || (col == 8 && last_move.from == 54) || (col < 8 && col > 1 && [index + 17, index + 15].includes(last_move.from))) {
            return true;
        }

        else {
            return false;
        }
    }
}

function white_castle_update() {

    if (pieces[63] !== "Pieces/rook-white.svg") {
        w_s_c_right = false;
    }

    if (pieces[56] !== "Pieces/rook-white.svg") {
        w_l_c_right = false;
    }

    if (pieces[60] !== "Pieces/king-white.svg") {
        w_s_c_right = false;
        w_l_c_right = false;
    }
}

function black_castle_update() {

    if (pieces[7] !== "Pieces/rook-black.svg") {
        b_s_c_right = false;
    }

    if (pieces[0] !== "Pieces/rook-black.svg") {
        b_l_c_right = false;
    }

    if (pieces[4] !== "Pieces/king-black.svg") {
        b_s_c_right = false;
        b_l_c_right = false;
    }
}

function attackedSquares(pieces, whiteTurn) {

    const opponent = whiteTurn ? "black" : "white"

    let attacked_squares = [];

    let pos = [
        [], [], [], [], [], []   // pawn, knight, bishop, rook, queen, king
    ];

    pieces.forEach((p, i) => {

        if (p == `Pieces/pawn-${opponent}.svg`) {
            pos[0].push(i);
        }

        else if (p == `Pieces/knight-${opponent}.svg`) {
            pos[1].push(i);
        }

        else if (p == `Pieces/bishop-${opponent}.svg`) {
            pos[2].push(i);
        }

        else if (p == `Pieces/rook-${opponent}.svg`) {
            pos[3].push(i);
        }

        else if (p == `Pieces/queen-${opponent}.svg`) {
            pos[4].push(i);
        }

        else if (p == `Pieces/king-${opponent}.svg`) {
            pos[5].push(i);
        }
    })

    for (let j = 0; j < 6; j++) {

        for (let k = 0; k < pos[j].length; k++) {

            if (j === 0) {

                if (whiteTurn) {
                    let move = black_pawn_move(pos[j][k]);
                    for (let m = 0; m < move[1].length; m++) {
                        attacked_squares.push(move[1][m]);
                    }
                }

                else {
                    let move = white_pawn_move(pos[j][k]);
                    for (let m = 0; m < move[1].length; m++) {
                        attacked_squares.push(move[1][m]);
                    }
                }
            }

            else if (j === 1) {

                let move = knight_move(pos[j][k]);

                for (let m = 0; m < move.length; m++) {
                    attacked_squares.push(move[m]);
                }
            }

            else if (j === 2) {

                let move = bishop_move(pos[j][k]);

                for (let m = 0; m < 4; m++) {

                    for (let n = 0; n < move[m].length; n++) {

                        if (pieces[move[m][n]] == "") {
                            attacked_squares.push(move[m][n]);
                        }

                        else if (pieces[move[m][n]] != "") {
                            attacked_squares.push(move[m][n]);
                            break;
                        }
                    }
                }
            }

            else if (j === 3) {

                let move = rook_move(pos[j][k]);

                for (let m = 0; m < 4; m++) {

                    for (let n = 0; n < move[m].length; n++) {

                        if (pieces[move[m][n]] == "") {
                            attacked_squares.push(move[m][n]);
                        }

                        else if (pieces[move[m][n]] != "") {
                            attacked_squares.push(move[m][n]);
                            break;
                        }
                    }
                }
            }

            else if (j === 4) {

                let move = queen_move(pos[j][k]);

                for (let m = 0; m < 8; m++) {

                    for (let n = 0; n < move[m].length; n++) {

                        if (pieces[move[m][n]] == "") {
                            attacked_squares.push(move[m][n]);
                        }

                        else if (pieces[move[m][n]] != "") {
                            attacked_squares.push(move[m][n]);
                            break;
                        }
                    }
                }
            }

            else if (j === 5) {

                let move = king_move(pos[j][k]);

                for (let n = 0; n < move.length; n++) {

                    attacked_squares.push(move[n]);

                }
            }
        }
    }

    attacked_squares = [...new Set(attacked_squares)];

    return attacked_squares;
}

function isCheck() {
    let color = whiteTurn ? "white" : "black";
    return attacked_Squares.includes(pieces.indexOf(`Pieces/king-${color}.svg`));
}

function isLegalPos(pieces, whiteTurn) {
    let color = whiteTurn ? "black" : "white";
    let attacked = attackedSquares(pieces, !whiteTurn);
    return !attacked.includes(pieces.indexOf(`Pieces/king-${color}.svg`));
}

function hasMoves(whiteTurn) {

    let color = whiteTurn ? "white" : "black";

    for (let i = 0; i < 64; i++) {

        if (!pieces[i].includes(`${color}`)) continue;

        let s = square[i];

        s.click();

        if (document.querySelector(".highlight")) {

            removeClass();

            return true;

        }

    }

    removeClass();

    return false;
}

function checkGameOver() {

    if (hasMoves(whiteTurn)) return;

    else {
        if (isCheck()) {
            msg.innerText = `${whiteTurn?"BLACK":"WHITE"} won by CHECKMATE`;
        }
        else {
            msg.innerText = `DRAW by STALEMATE`;
        }
    }
}

function point_counter() {
    let whiteCount = 0;
    let blackCount = 0;
    pieces.forEach((p, i) => {
        if (p != "") {
            if (p.includes("white")) {
                if (p.includes("pawn")) {
                    whiteCount++;
                }
                else if (p.includes("knight") || p.includes("bishop")) {
                    whiteCount += 3;
                }
                else if (p.includes("rook")) {
                    whiteCount += 5;
                }
                else if (p.includes("queen")) {
                    whiteCount += 9;
                }
                else {
                    whiteCount += 0;
                }
            }

            else {
                if (p.includes("pawn")) {
                    blackCount++;
                }
                else if (p.includes("knight") || p.includes("bishop")) {
                    blackCount += 3;
                }
                else if (p.includes("rook")) {
                    blackCount += 5;
                }
                else if (p.includes("queen")) {
                    blackCount += 9;
                }
                else {
                    blackCount += 0;
                }
            }
        }
    })
    document.querySelector(".white_point").innerHTML = whiteCount;
    document.querySelector(".black_point").innerHTML = blackCount;
}