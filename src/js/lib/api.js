import user from '../state/user';
import ui from '../state/ui';

const API_HOST = 'https://freefeed.net';

export function startSession(userName, password) {
    return apiResp(fetch(`${API_HOST}/v1/session`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `username=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`
    }));
}

export function whoami() {
    return apiCall('/v2/users/whoami');
}

export function createPost(body, feeds) {
    return apiCall('/v1/posts', {
        post: {body, attachments: []},
        meta: {feeds, commentsDisabled: false}
    });
}

export function saveFrontPrefs(key, data) {
    return apiCall(
        `/v1/users/${encodeURIComponent(user.id)}`,
        {user: {frontendPreferences: {[key]: data}}},
        'PUT'
    );
}

export function bookmarklet(title, images, comment, feeds) {
    return apiCall(
        '/v1/bookmarklet',
        {title, images, meta: {feeds}, comment}
    ).then(resp => {
        const author = resp.users
            .find(a => a.id === resp.posts.createdBy);

        const recipients = resp.posts.postedTo
            .map(id => resp.subscriptions.find(s => s.id === id).user)
            .map(id => resp.subscribers.find(s => s.id === id));

        let postURLName = author.username;
        if (!recipients.some(r => r.type === "user")) {
            postURLName = recipients[0].username;
        }
        return `${postURLName}/${resp.posts.id}`;
    });
}

////////////////////////////////

function apiCall(uri, postData = null, method = 'POST') {
    const opts = {
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'X-Authentication-Token': user.token
        }
    };
    if (postData) {
        opts.method = method;
        opts.body = JSON.stringify(postData);
        opts.headers['Content-Type'] = 'application/json';
    }
    return apiResp(fetch(API_HOST + uri, opts));
}

function apiResp(prom) {
    ui.setLoading(true);
    return prom
        .then(resp => resp.json())
        .then(resp => {
            if ('err' in resp) {
                if (typeof resp.err !== 'string' && 'message' in resp.err) {
                    throw new Error(resp.err.message);
                }
                throw new Error(resp.err.toString());
            }
            return resp;
        })
        .finally(() => ui.setLoading(false));
}

