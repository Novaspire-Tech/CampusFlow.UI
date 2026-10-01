import errorImage from '../assets/Image/pagenotfound.jpg'

export default function PageNotFound() {
  return (
    <div>
      <div className='md:h-20 h-12 flex justify-center items-center bg-[#424242] w-full'>
        <p className='text-white text-lg md:text-2xl font-medium md:font-bold'>Page Not Found !</p>
      </div>
      <div className='h-[60vh] flex justify-center items-center '>
        <img src={errorImage} className='h-[50vh] md:w-[18vw] w-[33vw] ' alt="" />
      </div>
      <div className='flex w-full flex-col justify-center items-center'>
        <h2 className='text-[#cc0000] font-inter text-xl md:text-2xl lg:text-4xl font-medium  '>The page you were looking for doesn't exist.</h2>
        <p className='text-[#424242] mt-1 font-inter text-base md:text-lg lg:text-[22px] font-normal'>You may have mistyped the address or the page may have moved.</p>

        <button onClick={() => window.history.back()} className='bg-[#727272] mt-3 text-white py-1 px-3 rounded font-inter text-base md:text-[22px] font-normal'>Back to Previous Page</button>
      </div>
    </div>
  )
}
