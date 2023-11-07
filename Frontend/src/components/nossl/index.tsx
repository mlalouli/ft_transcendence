import React, {ReactNode} from 'react';
import dynamic from 'next/dynamic';

const NoSSRWrapper = ({children} : {children : ReactNode}) => (
    <React.Fragment> {children} </React.Fragment>
);

export default dynamic(() => Promise.resolve(NoSSRWrapper),{
    ssr: false,
})