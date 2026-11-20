import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.scss';

interface Props {
    /** Titel des Rätsels, wird wie im Original als `--- titel ---` dargestellt */
    title?: string;
    /** Link zum Original-Rätsel */
    href?: string;
    className?: string;
    children: React.ReactNode;
}

/**
 * Stellt den Inhalt im Stil von https://adventofcode.com dar.
 */
const AdventOfCode = (props: Props) => {
    const { title, href, className, children } = props;
    return (
        <article className={clsx(styles.aoc, 'noComment', className)}>
            {title && <div className={clsx(styles.title)}>--- {title} ---</div>}
            <div className={clsx(styles.content)}>{children}</div>
            {href && (
                <p className={clsx(styles.source)}>
                    Original:{' '}
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        {href}
                    </a>
                </p>
            )}
        </article>
    );
};

export const Star = () => <span className={clsx(styles.star)}>*</span>;

export default AdventOfCode;
