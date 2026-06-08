import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.scss';
import HomepageCourses from '@tdev-components/HomepageCourses';
import _ from 'es-toolkit/compat';
import { observer } from 'mobx-react-lite';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary index-page', styles.heroBanner)}>
            <div className="container index-page-title">
                <h1 className="hero__title">{siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
            </div>
        </header>
    );
}

const Home = observer(() => {
    return (
        <div className={clsx('no-search')}>
            <Layout>
                <HomepageHeader />
                <main className={clsx(styles.main)}>
                    <h1>EF 2028</h1>
                    <HomepageCourses />
                </main>
            </Layout>
        </div>
    );
});
export default Home;
