import React from 'react'

// text used as prop
const HighlightText = ({text}) => {
  return (
    <span className='font-bold text-richblue-200'>
        {" "}
        {text}
    </span>
  )
}

export default HighlightText