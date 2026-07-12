// This file is never changed by teaching-dev.
// Use it to override or extend your app configuration.

import { mdiSourceCommit } from '@mdi/js';
import type { SiteConfigProvider } from '@tdev/siteConfig/siteConfig';
import {
    accountSwitcher,
    loginProfileButton,
    requestTarget,
    taskStateOverview,
    devModeAccessLocalFS,
    personalSpaceOverlay
} from './src/siteConfig/navbarItems';
import { brythonCodePluginConfig } from './src/siteConfig/pluginConfigs';
import { themes as prismThemes } from 'prism-react-renderer';

const GIT_COMMIT_SHA = process.env.GITHUB_SHA || Math.random().toString(36).substring(7);
const getSiteConfig: SiteConfigProvider = () => {
    return {
        title: 'Informatik',
        tagline: 'Gymnasium Biel-Seeland',
        url: 'https://efi.gbsl.website',
        gitHub: {
            orgName: 'gbsl-informatik',
            projectName: 'ef-2028'
        },
        siteStyles: ['website/css/custom.scss'],
        socialCard: 'img/social-card.jpg',
        logo: 'img/logo.svg',
        personalSpaceDocRootId: 'e1097f86-c945-4c06-81cd-bb52c8811cb8',
        navbarItems: [
            taskStateOverview,
            devModeAccessLocalFS,
            accountSwitcher,
            requestTarget,
            personalSpaceOverlay,
            loginProfileButton
        ],
        showEditThisPage: 'teachers',
        showEditThisPageOptions: ['github', 'github-dev'],
        tdevConfig: {
            taskStateOverview: {
                hideTeachers: true
            },
            excalidraw: {
                excalidoc: true
            },
            loggedOutOverlay: {
                disable: process.env.NODE_ENV !== 'production'
            }
        },
        footer: {
            links: [
                {
                    title: 'Tools',
                    items: [
                        {
                            label: 'VS Code',
                            to: 'https://code.visualstudio.com/'
                        },
                        {
                            label: 'Python',
                            to: 'https://www.python.org/'
                        },
                        {
                            label: 'Excalidraw',
                            to: '/excalidraw'
                        }
                    ]
                }
            ],
            copyright: `<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de">
                            <div style="display: flex; flex-direction: column; align-items: center;">
                              <img style="height: 1.6em" src="/img/by-nc-sa.eu.svg" alt="CC-BY-NC-SA">
                              <div>
                                Text und Bilder von brr und hfr, Ausnahmen sind gekennzeichnet. 
                              </div>
                            </div>
                          </a>
                          <a 
                            class="badge badge--primary"
                            style="margin-top: 0.5rem;"
                            href="https://github.com/gbsl-informatik/ef-2028/commits/${GIT_COMMIT_SHA}"
                          >
                              <svg viewBox="0 0 24 24" role="presentation" style="width: 0.9rem; height: 0.9rem; transform: translateY(15%) rotate(90deg); transform-origin: center center;"><path d="${mdiSourceCommit}" style="fill: currentcolor;"></path></svg> ${GIT_COMMIT_SHA.substring(0, 7)}
                          </a>`
        },
        themeConfig: {
            docs: {
                sidebar: {
                    hideable: true
                }
            },
            prism: {
                theme: prismThemes.github,
                darkTheme: prismThemes.dracula,
                additionalLanguages: ['bash', 'typescript', 'json', 'python', 'armasm']
            }
        },
        scripts: [
            {
                src: 'https://umami.gbsl.website/tell-me.js',
                ['data-website-id']: process.env.UMAMI_ID,
                ['data-domains']: 'efi.gbsl.website',
                async: true,
                defer: true
            }
        ],
        plugins: [
            brythonCodePluginConfig(),
            () => {
                return {
                    name: 'yaml-loader-config',
                    configureWebpack(config, isServer, { currentBundler }) {
                        return {
                            module: {
                                rules: [
                                    {
                                        test: /\.ya?ml$/,
                                        use: 'yaml-loader'
                                    }
                                ]
                            }
                        };
                    }
                };
            }
        ],
        docs: {
            lastVersion: 'current',
            routeBasePath: '/',
            exclude: process.env.NODE_ENV === 'production' ? ['tdev/**'] : [],
            showLastUpdateTime: true,
            includeCurrentVersion: true,
            sidebarCollapsible: true
        },
        blog: {},
        apiDocumentProviders: [
            require.resolve('@tdev/netpbm-graphic/register'),
            require.resolve('@tdev/text-message/register'),
            require.resolve('@tdev/pyodide-code/register'),
            require.resolve('@tdev/brython-code/register'),
            require.resolve('@tdev/webserial/register'),
            require.resolve('@tdev/page-read-check/register')
        ]
    };
};

export default getSiteConfig;
