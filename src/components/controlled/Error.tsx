import React from 'react';

interface ErrorProps {
    error? : {message? : string}
}

const Error: React.FC<ErrorProps> = ({error}) =>{
    if(!error?.message) return null ;
    return <p className='text-red-500 text-sm mt-1'>{error.message}</p>
}

export default Error;