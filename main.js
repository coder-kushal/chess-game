const winOverlay = document.getElementById('winner-overlay');
const closeBtn = document.getElementById('close-popup-btn');
const who = document.querySelector("#who");
const how = document.querySelector("#how");
const no_of_moves = document.querySelector("#moves");
// const msg = document.querySelector("game_msg");
// const white_point = document.querySelector(".white_point");
// const black_point = document.querySelector(".black_point");

let w_s_c_right = true;
let w_l_c_right = true;
let b_s_c_right = true;
let b_l_c_right = true;

let promotedPiece;

let moveCount = 0;

let whiteTurn = false; // I'm keeping it false because when the update is called it gets flipped to true

const square = Array.from(document.getElementsByClassName("square"));

const startPos = [
    "Pieces/rook-black.svg", "Pieces/knight-black.svg", "Pieces/bishop-black.svg", "Pieces/queen-black.svg", "Pieces/king-black.svg", "Pieces/bishop-black.svg", "Pieces/knight-black.svg", "Pieces/rook-black.svg",
    "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg", "Pieces/pawn-black.svg",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg", "Pieces/pawn-white.svg",
    "Pieces/rook-white.svg", "Pieces/knight-white.svg", "Pieces/bishop-white.svg", "Pieces/queen-white.svg", "Pieces/king-white.svg", "Pieces/bishop-white.svg", "Pieces/knight-white.svg", "Pieces/rook-white.svg"
];

let pieces = [...startPos];

let lastPosition = [];

const storedMoves = [];

const storedPositions = [];

let attacked_Squares = [];

let last_move = {};

let currentMoveNotation;

const storeNotations = [];

function removeClass() {
    document.querySelector(".selected")?.classList.remove("selected");
    document.querySelectorAll(".highlight, .enPassant, .short_castle, .long_castle").forEach(h => {
        h.classList.remove("highlight", "enPassant", "short_castle", "long_castle");
    });
}

function storeMoves(selected, i) {
    const count = arr => arr.filter(p => p !== "").length;
    last_move.capture = count(pieces) < count(lastPosition);
    last_move.piece = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[0];
    last_move.color = `${selected.querySelector("img").getAttribute("src")}`.split("/")[1].split(".")[0].split("-")[1];
    last_move.from = square.indexOf(selected);
    last_move.to = i;
    const lastMove = [last_move.piece, last_move.color, last_move.from, last_move.to, last_move.capture];
    storedMoves.push(lastMove);
}

function render() {

    storedPositions.push([...pieces]);

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
    let moved = false;

    if (isLegalPos(pieces, !whiteTurn)) {

        white_castle_update();
        black_castle_update();
        checkPromotion();

        whiteTurn = !whiteTurn;

        if (whiteTurn) moveCount++;

        moved = true;
    }

    else {

        pieces = [...lastPosition];

        storedMoves.pop();

        storedPositions.pop();

        const prev = storedMoves[storedMoves.length - 1];

        last_move = prev ? { piece: prev[0], color: prev[1], from: prev[2], to: prev[3] } : {};
    }

    render();

    attacked_Squares = attackedSquares(pieces, whiteTurn); // Even though whiteTurn is passed here, it calculates the attacked squares of !whiteTurn

    if (moved && last_move.piece) {
        currentMoveNotation = moveNotation(last_move);
        storeNotations.push(currentMoveNotation);

        let notations = document.querySelector(".notations");

        document.querySelector(".recent")?.classList.remove("recent");

        if (last_move.color == "white") {
            let numSpan = document.createElement("span");
            let span = document.createElement("span");
            numSpan.classList.add("num");
            numSpan.innerText = `${moveCount}.`;
            span.innerText = currentMoveNotation;
            notations.appendChild(numSpan);
            notations.appendChild(span);
            span.classList.add("recent");
        }
        else {
            let span = document.createElement("span");
            span.innerText = currentMoveNotation;
            notations.appendChild(span);
            span.classList.add("recent");
        }

        notations.scrollTop = notations.scrollHeight;
    }

    if (isCheck()) {
        let color = whiteTurn ? "white" : "black";
        square[pieces.indexOf(`Pieces/king-${color}.svg`)].classList.add("check");
    }

    checkGameOver();
}

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

                            storeMoves(selected, i);

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

                                storeMoves(selected, i);

                                removeClass();

                                update();
                            }

                            else {

                                pieces[i - 8] = "";

                                pieces[square.indexOf(selected)] = "";

                                pieces[i] = selected.querySelector("img").getAttribute("src");

                                storeMoves(selected, i);

                                removeClass();

                                update();
                            }
                        }

                        else if (s.classList.contains("short_castle")) {

                            pieces[i] = pieces[i - 2];

                            pieces[i - 1] = pieces[i + 1];

                            pieces[i - 2] = "";

                            pieces[i + 1] = "";

                            storeMoves(selected, i);

                            removeClass();

                            update();
                        }

                        else if (s.classList.contains("long_castle")) {

                            pieces[i] = pieces[i + 2];

                            pieces[i + 1] = pieces[i - 2];

                            pieces[i + 2] = "";

                            pieces[i - 2] = "";

                            storeMoves(selected, i);

                            removeClass();

                            update();
                        }

                        else {

                            pieces[square.indexOf(selected)] = "";

                            pieces[i] = selected.querySelector("img").getAttribute("src");

                            storeMoves(selected, i);

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

update();

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
    let col = (index % 8) + 1;

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

let promoTimer;
let promotionSquare = -1;

function checkPromotion() {
    const i = pieces.findIndex((p, i) => p.includes("pawn") && (i < 8 || i > 55));
    if (i === -1) return;                      // no pawn on the last row, so do nothing

    const color = pieces[i].includes("white") ? "white" : "black";

    // 1. turn the pawn into a queen right now, so the game can carry on normally
    pieces[i] = `Pieces/queen-${color}.svg`;
    promotedPiece = "Q";
    promotionSquare = i;

    // 2. show the popup, with images in the pawn's color
    document.querySelectorAll(".promotion img").forEach(img => {
        img.src = `Pieces/${img.parentElement.id}-${color}.svg`;
    });

    const container = document.querySelector(".promotion-container");
    container.classList.remove("hidden");

    // 3. if nobody clicks within 5 seconds, close the popup (the queen stays)
    clearTimeout(promoTimer);
    promoTimer = setTimeout(() => {
        container.classList.add("hidden");
    }, 5000);
}

document.querySelectorAll(".promotion").forEach(btn => {
    btn.addEventListener("click", (e) => {
        clearTimeout(promoTimer);                              // stop the 5-second timer

        const id = e.currentTarget.id;                         // queen, rook, bishop or knight
        const letter = id === "knight" ? "N" : id[0].toUpperCase();
        const color = pieces[promotionSquare].includes("white") ? "white" : "black";

        pieces[promotionSquare] = `Pieces/${id}-${color}.svg`; // replace the temporary queen

        render();
        attacked_Squares = attackedSquares(pieces, whiteTurn);

        if (isCheck()) {
            const k = whiteTurn ? "white" : "black";
            square[pieces.indexOf(`Pieces/king-${k}.svg`)].classList.add("check");
        }

        // fix the last move in the notation list
        const recent = document.querySelector(".recent");
        let text = recent.innerText.replace(/[+#]$/, "").replace(/=.$/, `=${letter}`);
        if (isCheck()) text += hasMoves(whiteTurn) ? "+" : "#";

        recent.innerText = text;
        storeNotations[storeNotations.length - 1] = text;

        document.querySelector(".promotion-container").classList.add("hidden");
    });
});

function is_white_en_passant(index) {

    if ([24, 25, 26, 27, 28, 29, 30, 31].includes(index) && last_move.piece == "pawn" && last_move.color == "black" && [8, 9, 10, 11, 12, 13, 14, 15].includes(last_move.from) && [24, 25, 26, 27, 28, 29, 30, 31].includes(last_move.to)) {

        let col = (index % 8) + 1;

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

        removeClass();
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
            showWinnerPopup();
            who.innerText = `${whiteTurn ? "BLACK" : "WHITE"} won`;
            how.innerText = `by CHECKMATE`;
            no_of_moves.innerText = Math.ceil(storedMoves.length / 2);
        }

        else {
            showWinnerPopup();
            who.innerText = `DRAW`;
            how.innerText = `by STALEMATE`;
            no_of_moves.innerText = Math.ceil(storedMoves.length / 2);
        }
    }
}

// function point_counter() {
//     let whiteCount = 0;
//     let blackCount = 0;
//     pieces.forEach((p, i) => {
//         if (p != "") {
//             if (p.includes("white")) {
//                 if (p.includes("pawn")) {
//                     whiteCount++;
//                 }
//                 else if (p.includes("knight") || p.includes("bishop")) {
//                     whiteCount += 3;
//                 }
//                 else if (p.includes("rook")) {
//                     whiteCount += 5;
//                 }
//                 else if (p.includes("queen")) {
//                     whiteCount += 9;
//                 }
//                 else {
//                     whiteCount += 0;
//                 }
//             }

//             else {
//                 if (p.includes("pawn")) {
//                     blackCount++;
//                 }
//                 else if (p.includes("knight") || p.includes("bishop")) {
//                     blackCount += 3;
//                 }
//                 else if (p.includes("rook")) {
//                     blackCount += 5;
//                 }
//                 else if (p.includes("queen")) {
//                     blackCount += 9;
//                 }
//                 else {
//                     blackCount += 0;
//                 }
//             }
//         }
//     })
// }

function showWinnerPopup() {
    winOverlay.classList.add('active');
}

function hideWinnerPopup() {
    pieces = [...startPos]
    winOverlay.classList.remove('active');
    removeClass();
    storedPositions.length = 0;
    render();
    storedMoves.length = 0;
    lastPosition.length = 0;
    whiteTurn = true;
    w_s_c_right = w_l_c_right = b_s_c_right = b_l_c_right = true;
    attacked_Squares = attackedSquares(pieces, whiteTurn);
    last_move = {};
    storeNotations.length = 0;
    currentMoveNotation = "";
    document.querySelector(".notations").innerHTML = "";
    moveCount = 1;
}

closeBtn.addEventListener("click", hideWinnerPopup);

function resign() {
    showWinnerPopup();
    who.innerText = `${whiteTurn ? "BLACK" : "WHITE"} won`;
    how.innerText = "By RESIGNATION";
    no_of_moves.innerText = Math.ceil(storedMoves.length / 2);
}

// This should be called after the turn flips in update function
function moveNotation(last_move) {

    let piece = last_move.piece;
    let from = last_move.from;
    let to = last_move.to;
    let moveNot = "";

    const file = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "f", 7: "g", 8: "h" };

    if (piece == "pawn") {
        if ((Math.max(from, to) - Math.min(from, to)) % 8 == 0) {
            moveNot += `${square[to].id}`;
        }
        else {
            let f = square[from].id.slice(0, 1);
            let l = square[to].id;
            moveNot += `${f}x${l}`;
        }

        if (last_move.piece == "pawn" && ([0, 1, 2, 3, 4, 5, 6, 7].includes(last_move.to) || [56, 57, 58, 59, 60, 61, 62, 63].includes(last_move.to))) {
            moveNot += `=${promotedPiece}`;
        }
    }

    else if (piece == "knight") {
        moveNot += "N";

        let move = knight_move(to);

        let dupPieces = [];

        let oppColor = !whiteTurn ? "black" : "white";

        for (let j = 0; j < move.length; j++) {

            if (move[j] === from) continue;

            if (pieces[move[j]] == "") continue;

            else {
                if (pieces[move[j]].includes(`${oppColor}`)) continue;

                else {
                    if (!pieces[move[j]].includes("knight")) continue;

                    else {
                        dupPieces.push(move[j]);
                        continue;
                    }
                }
            }
        }

        let fromRow = Math.floor(from / 8) + 1;
        let fromCol = (from % 8) + 1;

        if (dupPieces.length !== 0) {
            let rows = [];
            let cols = [];

            for (let i = 0; i < dupPieces.length; i++) {

                let row = Math.floor(dupPieces[i] / 8) + 1;
                let col = (dupPieces[i] % 8) + 1;

                rows.push(row);
                cols.push(col);
            }

            if (!cols.includes(fromCol)) {
                moveNot += `${file[fromCol]}`;
            }

            else if (!rows.includes(fromRow)) {
                moveNot += `${9 - fromRow}`;
            }

            else {
                moveNot += `${square[from].id}`;
            }
        }

        if (last_move.capture) {
            moveNot += "x";
        }

        moveNot += `${square[to].id}`;
    }

    else if (piece == "bishop") {
        moveNot += "B";

        let move = bishop_move(to);

        let dupPieces = [];

        let oppColor = !whiteTurn ? "black" : "white";

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < move[i].length; j++) {

                if (move[i][j] === from) break;

                if (pieces[move[i][j]] == "") continue;

                else {
                    if (pieces[move[i][j]].includes(`${oppColor}`)) break;

                    else {
                        if (!pieces[move[i][j]].includes("bishop")) break;

                        else {
                            dupPieces.push(move[i][j]);
                            break;
                        }
                    }
                }
            }
        }

        let fromRow = Math.floor(from / 8) + 1;
        let fromCol = (from % 8) + 1;

        if (dupPieces.length !== 0) {
            let rows = [];
            let cols = [];

            for (let i = 0; i < dupPieces.length; i++) {

                let row = Math.floor(dupPieces[i] / 8) + 1;
                let col = (dupPieces[i] % 8) + 1;

                rows.push(row);
                cols.push(col);
            }

            if (!cols.includes(fromCol)) {
                moveNot += `${file[fromCol]}`;
            }

            else if (!rows.includes(fromRow)) {
                moveNot += `${9 - fromRow}`;
            }

            else {
                moveNot += `${square[from].id}`;
            }
        }

        if (last_move.capture) {
            moveNot += "x";
        }

        moveNot += `${square[to].id}`;
    }

    else if (piece == "rook") {
        moveNot += "R";

        let move = rook_move(to);

        let dupPieces = [];

        let oppColor = !whiteTurn ? "black" : "white";

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < move[i].length; j++) {

                if (move[i][j] === from) break;

                if (pieces[move[i][j]] == "") continue;

                else {
                    if (pieces[move[i][j]].includes(`${oppColor}`)) break;

                    else {
                        if (!pieces[move[i][j]].includes("rook")) break;

                        else {
                            dupPieces.push(move[i][j]);
                            break;
                        }
                    }
                }
            }
        }

        let fromRow = Math.floor(from / 8) + 1;
        let fromCol = (from % 8) + 1;

        if (dupPieces.length !== 0) {
            let rows = [];
            let cols = [];

            for (let i = 0; i < dupPieces.length; i++) {

                let row = Math.floor(dupPieces[i] / 8) + 1;
                let col = (dupPieces[i] % 8) + 1;

                rows.push(row);
                cols.push(col);
            }

            if (!cols.includes(fromCol)) {
                moveNot += `${file[fromCol]}`;
            }

            else if (!rows.includes(fromRow)) {
                moveNot += `${9 - fromRow}`;
            }

            else {
                moveNot += `${square[from].id}`;
            }
        }

        if (last_move.capture) {
            moveNot += "x";
        }

        moveNot += `${square[to].id}`;
    }

    else if (piece == "queen") {
        moveNot += "Q";

        let move = queen_move(to);

        let dupPieces = [];

        let oppColor = !whiteTurn ? "black" : "white";

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < move[i].length; j++) {

                if (move[i][j] === from) break;

                if (pieces[move[i][j]] == "") continue;

                else {
                    if (pieces[move[i][j]].includes(`${oppColor}`)) break;

                    else {
                        if (!pieces[move[i][j]].includes("queen")) break;

                        else {
                            dupPieces.push(move[i][j]);
                            break;
                        }
                    }
                }
            }
        }

        let fromRow = Math.floor(from / 8) + 1;
        let fromCol = (from % 8) + 1;

        if (dupPieces.length !== 0) {
            let rows = [];
            let cols = [];

            for (let i = 0; i < dupPieces.length; i++) {

                let row = Math.floor(dupPieces[i] / 8) + 1;
                let col = (dupPieces[i] % 8) + 1;

                rows.push(row);
                cols.push(col);
            }

            if (!cols.includes(fromCol)) {
                moveNot += `${file[fromCol]}`;
            }

            else if (!rows.includes(fromRow)) {
                moveNot += `${9 - fromRow}`;
            }

            else {
                moveNot += `${square[from].id}`;
            }
        }

        if (last_move.capture) {
            moveNot += "x";
        }

        moveNot += `${square[to].id}`;
    }

    else {
        if (from + 2 == to) {
            moveNot = "O-O";
        }

        else if (from - 2 == to) {
            moveNot = "O-O-O";
        }

        else {
            moveNot += "K";

            if (last_move.capture) {
                moveNot += "x";
            }

            moveNot += `${square[to].id}`;
        }
    }

    if (isCheck()) {
        if (hasMoves(whiteTurn)) {
            moveNot += "+";
        }
        else {
            moveNot += "#";
        }
    }

    return moveNot;
}

function flip() {
    let board = document.querySelector(".board");
    board.classList.toggle("flip");
}