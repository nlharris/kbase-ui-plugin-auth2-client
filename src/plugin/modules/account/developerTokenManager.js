/*global Promise*/
define([
    'kb_common/html',
    'kb_common/domEvent2',
    'kb_common/bootstrapUtils',
    'kb_common/format',
    '../lib/format',
    '../lib/utils'
], function (
    html,
    DomEvent,
    BS,
    Format,
    fmt,
    Utils
) {
    var // t = html.tagMaker(),
        t = html.tag,
        div = t('div'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td'),
        button = t('button'),
        form = t('form'),
        input = t('input'),
        label = t('label'),
        p = t('p'),
        b = t('b'),
        span = t('span');

    function factory(config) {
        var hostNode, container;
        var runtime = config.runtime;
        var serverBias;
        var utils = Utils.make({
            runtime: runtime
        });

        var vm = {
            roles: {
                value: null
            },
            alerts: {
                id: html.genId(),
                enabled: true,
                value: false
            },
            addTokenForm: {
                id: html.genId(),
                enabled: true,
                value: null
            },
            allTokens: {
                id: html.genId(),
                enabled: true,
                value: null
            },
            newToken: {
                id: html.genId(),
                enabled: true,
                value: null
            }
        };

        function bindVmNode(vmNode) {
            vmNode.node = document.getElementById(vmNode.id);
        }

        function bindVm() {
            bindVmNode(vm.addTokenForm);
            bindVmNode(vm.alerts);
            bindVmNode(vm.newToken);
            bindVmNode(vm.allTokens);
        }

        function showAlert(type, message) {
            var alert = div({
                class: 'alert ' + 'alert-' + type,
                style: {
                    marginTop: '10px'
                },
                dataBind: 'css: messageType'
            }, [
                button({
                    type: 'button',
                    class: 'close',
                    dataDismiss: 'alert',
                    ariaLabel: 'Close'
                }, span({
                    ariaHidden: 'true'
                }, '&times;')),
                div({}, message)
            ]);
            var temp = document.createElement('div');
            temp.innerHTML = alert;
            vm.alerts.node.appendChild(temp);
        }

        function timeRemaining(time) {
            var now = new Date().getTime();
            return time - (now + serverBias);
        }

        function renderLayout() {
            container.innerHTML = div({
                style: {
                    marginTop: '10px'
                }
            }, [
                BS.buildTabs({
                    tabs: [{
                        name: 'main',
                        title: 'Manage Your Developer Tokens',
                        body: div({
                            style: {
                                marginTop: '10px'
                            }
                        }, [
                            div({
                                id: vm.alerts.id
                            }),
                            BS.buildPanel({
                                classes: ['kb-panel-light'],
                                title: 'Add a new developer token',
                                body: [
                                    div({
                                        id: vm.addTokenForm.id,
                                        style: {
                                            marginBottom: '10px'
                                        }
                                    }),
                                    div({
                                        id: vm.newToken.id
                                    })
                                ]
                            }),
                            BS.buildPanel({
                                classes: ['kb-panel-light'],
                                title: 'Your active developer tokens',
                                body: div({
                                    id: vm.allTokens.id
                                })
                            })
                        ])
                    }]
                }).content
            ]);
            bindVm();
        }

        function niceDate(epoch) {
            var date = new Date(epoch);
            return Format.niceTime(date);
        }

        function doRevokeToken(tokenId) {
            // Revoke
            runtime.service('session').getClient().revokeToken(tokenId)
                .then(function () {
                    return render();
                })
                .catch(function (err) {
                    console.error('ERROR', err);
                });
        }

        function renderNewToken() {
            var newToken = vm.newToken.value;
            var clockId = html.genId();
            var events = new DomEvent.make({
                node: vm.newToken.node
            });
            vm.newToken.node.innerHTML = div({
                class: 'well',
                style: {
                    marginTop: '10px'
                }
            }, [
                p('New ' + b(newToken.type) + ' token successfully created'),
                p('Please copy it to a secure location and remove this message'),
                p('This message will self-destruct in ' + span({ id: clockId }) + '.'),
                p([
                    'New Token: ',
                    span({
                        style: {
                            fontWeight: 'bold',
                            fontSize: '120%',
                            fontFamily: 'monospace'
                        }
                    }, newToken.token)
                ]),
                div(button({
                    type: 'button',
                    class: 'btn btn-danger',
                    id: events.addEvent({
                        type: 'click',
                        handler: function () {
                            clock.stop();
                            vm.newToken.node.innerHTML = '';
                        }
                    })
                }, 'Done'))
            ]);
            events.attachEvents();

            function CountDownClock(countDownInSeconds, id) {
                var countdown = countDownInSeconds * 1000;
                var node = document.getElementById(id);
                var startTime = new Date().getTime();
                var timer;
                if (!node) {
                    return;
                }

                function render(timeLeft) {
                    node.innerHTML = fmt.niceDuration(timeLeft);
                }

                function loop() {
                    timer = window.setTimeout(function () {
                        var now = new Date().getTime();
                        var elapsed = now - startTime;
                        render(countdown - elapsed);
                        if (elapsed < countdown) {
                            loop();
                        } else {
                            vm.newToken.node.innerHTML = '';
                        }
                    }, 500);
                }

                function stop() {
                    countdown = 0;
                    if (timer) {
                        window.clearTimeout(timer);
                    }
                }
                render();
                loop();
                return {
                    stop: stop
                };
            }
            var clock = CountDownClock(300, clockId);
        }

        function handleSubmitAddToken() {
            var name = vm.addTokenForm.node.querySelector('[name="name"]');

            var tokenName = name.value;
            if (tokenName.length === 0) {
                showAlert('danger', 'A token must have a non-zero length name');
                return;
            }

            runtime.service('session').getClient().createToken({
                    name: name.value,
                    type: 'developer'
                })
                .then(function (result) {
                    vm.newToken.value = result;
                    renderNewToken();
                    return render();
                })
                .catch(function (err) {
                    console.error('ERROR', err);
                });

        }

        function renderAddTokenForm() {
            var events = DomEvent.make({
                node: vm.addTokenForm.node
            });
            vm.addTokenForm.node.innerHTML = form({
                class: 'form-inline',
                id: events.addEvent({
                    type: 'submit',
                    handler: function (e) {
                        e.preventDefault();
                        handleSubmitAddToken();
                        return false;
                    }
                })
            }, div({
                class: 'form-group'
            }, [
                label({
                    style: {
                        marginRight: '4px'
                    }
                }, 'Token name'),
                input({
                    name: 'name',
                    class: 'form-control'
                }),
                ' ',
                button({
                    class: 'btn btn-primary',
                    type: 'submit'
                }, 'Create Token')
            ]));
            events.attachEvents();
        }

        function renderTokens() {
            var events = DomEvent.make({
                node: vm.allTokens.node
            });
            var revokeAllButton;
            if (vm.allTokens.value.length > 0) {
                revokeAllButton = button({
                    type: 'button',
                    class: 'btn btn-danger',
                    id: events.addEvent({
                        type: 'click',
                        handler: doRevokeAll
                    })
                }, 'Revoke All');
            } else {
                revokeAllButton = button({
                    type: 'button',
                    class: 'btn btn-danger',
                    disabled: true
                }, 'Revoke All');
            }
            vm.allTokens.node.innerHTML = table({
                class: 'table table-striped',
                style: {
                    width: '100%'
                }
            }, [
                tr([
                    th({
                        style: {
                            width: '25%'
                        }
                    }, 'Created'),
                    th({
                        style: {
                            width: '25%'
                        }
                    }, 'Expires'),
                    th({
                        style: {
                            width: '25%'
                        }
                    }, 'Name'),
                    th({
                        style: {
                            width: '25%',
                            textAlign: 'right'
                        }
                    }, revokeAllButton)
                ])
            ].concat(vm.allTokens.value.map(function (token) {
                return tr([
                    td(niceDate(token.created)),
                    td(fmt.niceDuration(timeRemaining(token.expires), {
                        trimEnd: true
                    })),
                    td(token.name),
                    td({
                        style: {
                            textAlign: 'right'
                        }
                    }, button({
                        class: 'btn btn-danger',
                        type: 'button',
                        id: events.addEvent({
                            type: 'click',
                            handler: function () {
                                doRevokeToken(token.id);
                            }
                        })
                    }, 'Revoke'))
                ]);
            })));
            events.attachEvents();
        }

        function doRevokeAll() {
            return Promise.all(vm.allTokens.value.map(function (token) {
                    return runtime.service('session').getClient().revokeToken(token.id);
                }))
                .then(function () {
                    return render();
                })
                .catch(function (err) {
                    console.error('ERROR', err);
                });
        }

        function render() {
            return runtime.service('session').getClient().getTokens()
                .then(function (result) {
                    vm.allTokens.value = result.tokens
                        .filter(function (token) {
                            return (token.type === 'Developer');
                        });

                    renderTokens();
                    renderAddTokenForm();
                })
                .catch(function (err) {
                    console.error('ERROR', err);
                    showAlert('danger', 'Sorry, error, look in console: ' + err.message);
                });
        }

        function attach(node) {
            return Promise.try(function () {
                hostNode = node;
                container = hostNode.appendChild(document.createElement('div'));
            });
        }

        function start(params) {
            return utils.getTimeBias()
                .then(function (bias) {
                    serverBias = bias;
                    renderLayout();
                    return render();
                });
        }

        function stop() {
            return Promise.try(function () {});
        }

        function detach() {
            return Promise.try(function () {
                if (hostNode && container) {
                    hostNode.removeChild(container);
                    hostNode.innerHTML = '';
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