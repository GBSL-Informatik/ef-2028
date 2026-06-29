import fs from 'fs';
import path from 'path';
import Rsync from 'rsync';
import { ConfigType, ensureSync, loadMaterialConfig, resolveMaterialConfig } from './material_helpers';
const repoRoot = path.resolve(__dirname, '..');
process.chdir(repoRoot);

const typedConfig: ConfigType = loadMaterialConfig();

const DOC_PATHS = ['docs/', 'src/pages/', 'news/'];

const docBasePath = (src: string): string => {
    return DOC_PATHS.find((p) => src.startsWith(p)) || DOC_PATHS[0];
};

/**
 * Recursively find markdown template files (starting with _)
 */
const findMdTemplate = (src: string): string[] => {
    const mdFiles: string[] = [];
    if (fs.lstatSync(src).isDirectory()) {
        fs.readdirSync(src).forEach((file) => {
            const fname = path.join(src, file);
            if (fs.lstatSync(fname).isDirectory()) {
                mdFiles.push(...findMdTemplate(fname));
            } else if ((file.endsWith('.md') || file.endsWith('.mdx')) && file.startsWith('_')) {
                mdFiles.push(fname);
            }
        });
    } else {
        if ((src.endsWith('.md') || src.endsWith('.mdx')) && src.startsWith('_')) {
            mdFiles.push(src);
        }
    }
    return mdFiles;
};

/**
 * Get path relative to doc base path
 */
const relative2Doc = (p: string): string => {
    const base = docBasePath(p);
    return base ? p.slice(base.length) : p;
};

const ensureStartingSlash = (p: string): string => {
    if (typeof p !== 'string') {
        return p;
    }
    if (p.startsWith('/')) {
        return p;
    }
    return `/${p}`;
};

const ensureTrailingSlash = (p: string): string => {
    if (typeof p !== 'string') {
        return p;
    }
    if (p.endsWith('/')) {
        return p;
    }
    return `${p}/`;
};

const main = async (): Promise<void> => {
    if (process.env.WITHOUT_DOCS) {
        /**
         * move docs/ to _docs/ and make sure docusaurus can still build the site.
         * Can be undone by running the restore script.
         */
        console.log('RENAMING docs/ to _docs/');
        fs.renameSync('docs', '_docs');
        fs.mkdirSync('docs');
        fs.cpSync('_docs/home.md', 'docs/home.md');
        /** copy all markdown-templates - otherwise some pages might fail */
        findMdTemplate(path.join(__dirname, '../_docs')).forEach((file) => {
            fs.cpSync(file, file.replace('/_docs/', '/docs/'));
        });
    }
    if (process.env.DOCS_ONLY) {
        /* Build only the docs - can be undone by running the restore script */
        if (fs.existsSync('versioned_docs')) {
            console.log('RENAMING versioned_docs/ to _versioned_docs/');
            fs.renameSync('versioned_docs', '_versioned_docs');
            fs.mkdirSync('versioned_docs');
        }
        if (fs.existsSync('versioned_sidebars')) {
            console.log('RENAMING versioned_sidebars/ to _versioned_sidebars/');
            fs.renameSync('versioned_sidebars', '_versioned_sidebars');
            fs.mkdirSync('versioned_sidebars');
        }
        if (fs.existsSync('versions.json')) {
            console.log('RENAMING versions.json to _versions.json');
            fs.renameSync('versions.json', '_versions.json');
            fs.writeFileSync('versions.json', '[\n  "current"\n]');
        }
    }
    if (fs.existsSync('CNAME')) {
        fs.cpSync('CNAME', 'static/CNAME');
    }
    for (const klass of Object.keys(typedConfig)) {
        // Object.keys(typedConfig).forEach(async (klass) => {
        const config = typedConfig[klass];
        const gitignore: string[] = [];
        const classDir = klass === 'pages' ? 'src/pages/' : `versioned_docs/version-${klass}/`;
        for (const _config of config) {
            // config.forEach(async (_config) => {
            const config = resolveMaterialConfig(klass, _config);
            const ignore: string[] = [];
            ignore.push(...(config.ignore || []));

            let srcPath = config.from;

            if (process.env.WITHOUT_DOCS && config.from.startsWith('docs/')) {
                srcPath = `_${srcPath}`;
            }

            const isDir = fs.lstatSync(srcPath).isDirectory();
            if (isDir) {
                srcPath = ensureTrailingSlash(srcPath);
            }

            const destParent = path.dirname(config.to);
            if (!fs.existsSync(destParent)) {
                fs.mkdirSync(destParent, { recursive: true });
            }

            if (isDir) {
                const sanitizedClassDir = ensureTrailingSlash(config.to.replace(classDir, ''));
                gitignore.push(`${sanitizedClassDir}*`);
                const rsync = new Rsync()
                    .flags('v')
                    .source(srcPath)
                    .destination(config.to)
                    .archive()
                    .delete();
                if (ignore.length > 0) {
                    rsync.exclude(ignore.map((i) => ensureStartingSlash(i)));
                    ignore.forEach((ifile) => {
                        const opath = `${srcPath}${ifile}`;
                        const ipath = `${sanitizedClassDir}${ifile}`;
                        if (!fs.existsSync(opath)) {
                            console.warn(
                                `⚠️ [ignore] ${klass}->${srcPath}: ignored "${ifile}" does not exist`
                            );
                            return;
                        }
                        if (fs.lstatSync(opath).isDirectory()) {
                            gitignore.push(`!${ensureTrailingSlash(ipath)}`);
                        } else {
                            gitignore.push(`!${ipath}`);
                        }
                    });
                }
                rsync.exclude(['.sync.*', '*.nosync.*']);
                console.log('SYNC', config.to, srcPath);
                await ensureSync(rsync, srcPath);
            } else {
                fs.copyFileSync(srcPath, config.to);
                gitignore.push(config.to.replace(classDir, ''));
            }

            if (config.open) {
                const folder = isDir ? config.to : destParent;
                try {
                    fs.mkdirSync(folder, { recursive: true });
                } catch (e) {
                    console.log(e);
                }
                const categoryPath = path.join(folder, '_category_.json');
                console.log('---------- CAT', categoryPath);
                gitignore.push(categoryPath.replace(classDir, ''));
                let category: Record<string, unknown> = {
                    collapsible: true,
                    collapsed: false,
                    className: 'library-item marked'
                };
                if (fs.existsSync(categoryPath)) {
                    category = JSON.parse(fs.readFileSync(categoryPath, 'utf-8'));
                    category.collapsed = false;
                    category.collapsible = true;
                    category.className = 'library-item marked';
                }
                fs.writeFileSync(categoryPath, JSON.stringify(category, undefined, 2) + '\n');
            }

            fs.writeFileSync(`${classDir}.gitignore`, gitignore.join('\n'));
        }
    }
};

main().catch((e: Error) => {
    console.error(e);
    process.exit(1);
});
