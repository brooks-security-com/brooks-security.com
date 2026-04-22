function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Check if URI ends with '/' or does not contain a dot ('.')
    if (uri.endsWith('/') || !uri.includes('.')) {
        request.uri += 'index.html';
    }

    return request;
}
