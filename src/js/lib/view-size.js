// see https://bugzilla.mozilla.org/show_bug.cgi?id=156388#c14
export default function () {
    var doc = docElem('clientWidth'),
        body = document.body,
        w, h;
    return isNumber(document.clientWidth) ? {w: document.clientWidth, h: document.clientHeight} :
        doc === body
        || (w = Math.max(doc.clientWidth, body.clientWidth)) > self.innerWidth
        || (h = Math.max(doc.clientHeight, body.clientHeight)) > self.innerHeight ? {
            width: body.clientWidth,
            height: body.clientHeight
        } :
        {width: w, height: h};
}

function docElem(property) {
    const t = document.documentElement || document.body.parentNode;
    return (t && isNumber(t[property])) ? t : document.body
}

function isNumber(n) {
    return (n !== undefined && n !== null && n.constructor === Number);
}