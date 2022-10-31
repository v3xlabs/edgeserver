// export const cx = (...classNames: string[]) =>
//     classNames.filter((a) => !!a).join(' ');

import classNames from 'classnames';

// Super small utility for combining class names
export const cx = (...arguments_: classNames.ArgumentArray) =>
    classNames(...arguments_);
