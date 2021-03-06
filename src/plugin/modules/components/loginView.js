define([
    'knockout-plus',
    'kb_common/html',
    'kb_common/bootstrapUtils',
    'kb_common_ts/Auth2Error',
    'kb_plugin_auth2-client',
    'yaml!../config.yml',
    'bootstrap'
], function (
    ko,
    html,
    BS,
    Auth2Error,
    Plugin,
    config
) {
    var t = html.tag,
        div = t('div'),
        span = t('span'),
        br = t('br', { close: false }),
        p = t('p'),
        a = t('a'),
        b = t('b'),
        button = t('button'),
        h3 = t('h3'),
        legend = t('legend'),
        i = t('i'),
        ul = t('ul'),
        li = t('li');

    function buildTabs() {
        return div({}, [
            ul({
                class: 'nav nav-tabs',
                role: 'tablist',
                dataBind: {
                    foreach: 'tabs'
                }
            }, [
                '<!-- ko if: show -->',
                li({
                    role: 'presentation',
                    style: {
                        fontWeight: 'bold'
                    },
                    dataBind: {
                        css: {
                            active: 'active'
                        }
                    }
                }, a({
                    dataBind: {
                        attrs: {
                            id: 'name',
                            href: '"#" + name'
                        },
                        html: 'label',
                        click: '$component.doSelectTab'
                    }
                })),
                '<!-- /ko -->'
            ]),
            div({
                class: 'tab-content',
                dataBind: {
                    foreach: 'tabs'
                }
            }, [
                '<!-- ko if: show -->',
                div({
                    role: 'tabpanel',
                    class: 'tab-pane',
                    style: {
                        paddingTop: '10px'
                    },
                    dataBind: {
                        css: {
                            active: 'active'
                        },
                        attrs: {
                            id: 'name'
                        },
                        template: {
                            nodes: 'template'
                        }
                    }
                }),
                '<!-- /ko -->'
            ])
        ]);
    }

    function buildLoginControl(runtime) {
        return div({
            dataBind: {
                ifnot: 'authorized'
            },
            style: {
                width: '80%',
                display: 'inline-block',
                minWidth: '210px'
            }
        }, [
            div({
                class: 'btn-group-vertical',
                style: {
                    width: '100%'
                },
                minWidth: '200px'
            }, [
                button({
                    class: 'btn btn-default',
                    style: {
                        textAlign: 'center'
                    },
                    dataBind: {
                        click: 'doSetSigninMode',
                        css: {
                            active: 'mode() === "signin"'
                        },
                        attr: {
                            'data-control': '"signin-button"'
                        }
                    }
                }, div({
                    style: {
                        display: 'inline-block',
                        width: '50%',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        verticalAlign: 'middle'
                    }
                }, [
                    span({
                        class: 'fa fa-sign-in fa-2x',
                        style: {
                            marginRight: '10px',
                            verticalAlign: 'middle'
                        }
                    }),
                    span({
                        style: {
                            verticalAlign: 'middle'
                        }
                    }, 'Sign In')

                ])),
                div({
                        dataBind: {
                            visible: 'mode() === "signin"'
                        }
                    },
                    div({
                        style: {
                            marginBottom: '20px',
                            padding: '4px',
                            // borderBottom: '1px silver solid',
                            backgroundColor: '#DDD',
                            textAlign: 'left'
                        }
                    }, [
                        div({
                            style: {
                                margin: '6px 0 0 0',
                                fontStyle: 'italic',
                                textAlign: 'center'
                            }
                        }, [
                            'Choose Globus if you signed up',
                            br(),
                            'before ',
                            span({
                                dataBind: {
                                    text: '$component.config.launchDate'
                                }
                            })
                        ]),
                        div({
                            // class: 'btn-group-vertical',
                            style: {
                                width: '100%',
                                display: 'inline-block',
                            },
                            dataBind: {
                                foreach: 'providers'
                            }
                        }, div({
                            dataBind: {
                                component: {
                                    name: '"signin-button"',
                                    params: {
                                        provider: '$data',
                                        runtime: '$component.runtime',
                                        nextRequest: '$component.nextRequest',
                                        assetsPath: '$component.assetsPath',
                                        origin: '"login"'
                                    }
                                }
                            }
                        }))
                        // div({
                        //     style: {
                        //         marginTop: '0.5em',
                        //         textAlign: 'center'
                        //     }
                        // }, [
                        //     input({
                        //         type: 'checkbox',
                        //         dataBind: {
                        //             checked: 'isSessionPersistent',

                        //         },
                        //     }),
                        //     ' Stay signed in'
                        // ]),
                    ])),
                button({
                    class: 'btn btn-default',
                    style: {
                        textAlign: 'center',
                        marginTop: '10px'
                    },
                    dataBind: {
                        click: 'doSignup',
                        attr: {
                            'data-control': '"signup-button"'
                        }
                    }
                }, div({
                    style: {
                        display: 'inline-block',
                        width: '50%',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        verticalAlign: 'middle'
                    }
                }, [
                    span({
                        class: 'fa fa-user-plus fa-2x',
                        style: {
                            marginRight: '10px',
                            verticalAlign: 'middle'
                        }
                    }),
                    span({
                        style: {
                            verticalAlign: 'middle'
                        }
                    }, 'New User')

                ]))
            ]),
            div({
                style: {
                    marginTop: '2em'
                }
            }, [
                a({
                    dataBind: {
                        attr: {
                            href: 'docs.troubleshooting.signin'
                        }
                    }
                }, 'Need Help?')
            ])
        ]);
    }

    function buildAuthControl() {
        return div({
            style: {
                textAlign: 'center'
            }
        }, [
            buildLoginControl()
        ]);
    }

    function buildWelcomeTab() {
        return div({

        }, [
            h3({
                style: {
                    marginTop: '0'
                }
            }, 'Sign in Changes'),
            p([
                'On ',
                span({
                    dataBind: {
                        text: '$component.config.launchDate'
                    }
                }),
                ' KBase launched a new sign-in system. ',
                'One of the changes is to replace a direct login to KBase with a sign-in ',
                'system using Google and Globus for user identification.'
            ]),
            p([
                b('If you previously logged in to KBase directly'),
                ' you will now ',
                'need to sign in using Globus. Simply click the Globus button, choose the "Globus ID" identity provider ',
                'on the Globus sign-in page, and sign in with your KBase username and password.'
            ]),
            p({
                style: {
                    xfontStyle: 'italic'
                }
            }, [
                'The reason your KBase username and password work at Globus is that KBase has always ',
                'used Globus and Globus ID behind the scenes. You may remember originally signing up with Globus, ',
                'but have likely not been exposed to it since.'
            ]),
            p([
                b('If you are a new user'),
                ' you may simply use the identity provider most convenient for you. '
            ]),
            p([
                a({ href: 'http://kbase.us/auth-update-2017' }, 'Read more about the update')
            ])

        ]);
    }

    function buildAboutTab() {
        return div([
            p([
                'After signing in, you can start working with KBase. Upload your experimental data and perform comparative genomics and systems biology analyses by creating ',
                i('Narratives'),
                ': interactive, dynamic, and shareable documents. Narratives include all your analysis steps, commentary, and visualizations.'
            ]),
            p([
                'Want to learn more?  Check out the ',
                a({
                    dataBind: {
                        attr: {
                            href: '$component.docs.narrativeGuide.url'
                        }
                    }
                    //href: runtime.config('resources.documentation.narrativeGuide.url') 
                }, 'Narrative Interface User Guide'),
                ' or the ',
                a({
                    href: 'https://youtu.be/6ql7HAUzU7U'
                }, 'Narrative Interface video tutorial'),
                ', and a ',
                a({
                    dataBind: {
                        attr: {
                            href: '$component.docs.tutorials.url'
                        }
                    }
                    // href: runtime.config('resources.documentation.tutorials.url') 
                }, 'library of tutorials'),
                ' that show you how to use various KBase apps to analyze your data.'
            ]),
        ]);
    }

    function buildAuthorizationRequired() {
        return div([
            p([
                'Authorization is required to access the path: ',
                span({
                    style: {
                        fontWeight: 'bold'
                    },
                    dataBind: {
                        text: '$component.nextRequest.original'
                    }
                })
            ]),
            p([
                'After signing in you will be redirected to the requested path.'
            ])
        ]);
    }

    function buildIntroNormal() {
        return div({}, [
            buildTabs()
        ]);
    }

    function template() {
        return div({
            class: 'container-fluid component-login-view',
            dataPlugin: 'auth2-client',
            dataComponent: 'login-view',
            dataWidget: 'login'
        }, [
            div({ class: 'row' }, [
                div({ class: 'col-sm-8 ' },
                    buildIntroNormal()
                ),
                div({ class: 'col-sm-4' }, [
                    div({ class: 'well well-kbase' }, [
                        div({ class: 'login-form' }, [
                            legend({ style: 'text-align: center' }, 'Use KBase'),
                            buildAuthControl()
                        ])
                    ])
                ])
            ])
        ]);
    }

    function makeNodes(markup) {
        var node = document.createElement('div');
        node.innerHTML = markup;
        return [node.firstChild];
    }

    function viewModel(params) {
        var runtime = params.runtime;
        var nextRequest = params.nextRequest;
        var source = params.source;
        var docs = runtime.config('resources.documentation');

        var authorized = runtime.service('session').isAuthorized();

        // todo set initial value from sessino service,
        // udpate session service when the value changes.
        // var isSessionPersistent = ko.observable(runtime.service('session').getClient().isSessionPersistent());

        // isSessionPersistent.subscribe(function (persist) {
        //     runtime.service('session').getClient().setSessionPersistent(persist);
        // });

        // TODO; populate from session, as above.
        var username = runtime.service('session').getUsername();

        var providers = runtime.service('session').getProviders().sort(function (a, b) {
            if (a.id === 'Google') {
                return -1;
            } else if (b.id === 'Google') {
                return 1;
            }
            if (a.id < b.id) {
                return -1;
            } else if (a.id > b.id) {
                return 1;
            }
            return 0;
        });

        function doSignup() {
            runtime.service('session').getClient().loginCancel()
                .catch(Auth2Error.AuthError, function (err) {
                    // ignore this specific error...
                    console.warn('Skipping error', err);
                })
                .finally(function () {
                    // don't care whether it succeeded or failed.
                    runtime.send('app', 'navigate', {
                        path: 'signup'
                    });
                });
        }

        var mode = ko.observable();

        function doSetSigninMode() {
            var currentMode = mode();
            if (currentMode === 'signin') {
                mode(null);
            } else {
                mode('signin');
            }
        }

        function doSetSignupMode() {
            var currentMode = mode();
            if (currentMode === 'signup') {
                mode(null);
            } else {
                mode('signup');
            }
        }

        // var title = ko.observable();
        var tabs = ko.observableArray([{
            name: 'authorization',
            label: 'Authorization Required',
            show: ko.computed(function () {
                return (source === 'authorization');
            }),
            active: ko.observable(false),
            template: makeNodes(buildAuthorizationRequired())
        }, {
            name: 'welcome',
            label: 'Welcome',
            show: true,
            active: ko.observable(false),
            template: makeNodes(buildWelcomeTab())
        }, {
            name: 'about',
            label: span({ class: 'fa fa-info-circle' }),
            show: true,
            active: ko.observable(false),
            template: makeNodes(buildAboutTab())
        }]);
        if (source === 'authorization') {
            tabs()[0].active(true);
        } else {
            tabs()[1].active(true);
        }

        function doSelectTab(data) {
            var selected = tabs().filter(function (item) {
                return item.active();
            });
            if (selected.length > 0 && selected[0].name === data.name) {
                return;
            }
            tabs().forEach(function (item) {
                if (item.active()) {
                    item.active(false);
                }
            });
            data.active(true);

        }

        var filteredTabs = tabs().filter(function (item) {
            return item.show;
        });

        return {
            runtime: runtime,
            nextRequest: nextRequest,
            assetsPath: Plugin.plugin.fullPath,
            source: source,
            docs: docs,
            // isSessionPersistent: isSessionPersistent,
            providers: providers,
            authorized: authorized,
            username: username,
            // doSignin: doSignin,
            doSignup: doSignup,
            doSetSigninMode: doSetSigninMode,
            doSetSignupMode: doSetSignupMode,
            mode: mode,
            tabs: filteredTabs,
            doSelectTab: doSelectTab,
            config: config
        };
    }

    function component() {
        return {
            template: template(),
            viewModel: viewModel
        };
    }
    ko.components.register('login-view', component());
});