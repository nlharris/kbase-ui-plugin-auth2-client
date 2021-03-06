/* global Promise */
define([
    'knockout',
    'kb_common/html',
    // for effect
    'bootstrap'
], function (
    ko,
    html
) {
    var t = html.tag,
        div = t('div');

    function factory(config) {
        var hostNode, container,
            runtime = config.runtime,
            nextRequest, source;

        function attach(node) {
            return Promise.try(function () {
                hostNode = node;
                container = hostNode.appendChild(document.createElement('div'));
            });
        }

        function showErrorMessage(message) {
            container.innerHTML = div({
                class: 'alert alert-danger'
            }, message);
        }

        function render() {
            try {
                container.innerHTML = div({
                    class: 'plugin-auth2-client widget-auth2_login',
                    dataPlugin: 'auth2-client',
                    dataWidget: 'auth2_signin',
                    dataBind: {
                        component: {
                            name: '"login-view"',
                            params: {
                                runtime: 'runtime',
                                source: 'source',
                                nextRequest: 'nextRequest'
                            }
                        }
                    }
                });
                ko.applyBindings({
                    runtime: runtime,
                    nextRequest: nextRequest,
                    source: source
                }, container);
            } catch (ex) {
                console.error('ERROR rendering login stuff', ex);
                showErrorMessage(ex);
            }
        }

        function doRedirect() {
            if (nextRequest) {
                try {
                    if (nextRequest) {
                        runtime.send('app', 'navigate', nextRequest);
                    } else {
                        runtime.send('app', 'navigate', 'dashboard');
                    }
                } catch (ex) {
                    runtime.send('app', 'navigate', 'dashboard');
                }
            } else {
                runtime.send('app', 'navigate', 'dashboard');
            }
        }

        function start(params) {
            return Promise.try(function () {
                // if is logged in, just redirect to the nextrequest,
                // or the nexturl, or dashboard.
                if (params.nextrequest) {
                    nextRequest = JSON.parse(params.nextrequest);
                } else {
                    nextRequest = null;
                }
                source = params.source;

                if (runtime.service('session').isLoggedIn()) {
                    doRedirect(params);
                    return null;
                }
                runtime.send('ui', 'setTitle', 'KBase Sign In');
                return render(params);
            });
        }

        function stop() {
            return Promise.try(function () {

            });
        }

        function detach() {
            return Promise.try(function () {
                if (hostNode && container) {
                    hostNode.removeChild(container);
                }
            });
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});