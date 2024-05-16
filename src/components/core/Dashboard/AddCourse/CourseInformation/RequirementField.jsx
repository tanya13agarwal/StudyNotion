import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  // hme ye form me first render pe name ko register krna h
  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions)
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // jb jb meri [requirementsList] update horhi hai, tb setValue kro name ki with the requirement ist
  useEffect(() => {
    setValue(name, requirementsList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirementsList])

  // function that adds requirements
  const handleAddRequirement = () => {
    // agr koi nayi requirement aayi hai then puraane data k sath usko bhi add krdo
    if (requirement) {
      setRequirementsList([...requirementsList, requirement])
      // kyuki current data add kr chuke hai , usko ab empty mark krdo
      setRequirement("") 
    }
  }

  // function that removes requirements
  const handleRemoveRequirement = (index) => {
    // ek variable me saari requirement list store krwane k baad usme se delete krdi using 
    // splice where we mention the index position and the no. of items to be deleted
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    // update the original requirements list
    setRequirementsList(updatedRequirements)
  }

  return (
    <div className="flex flex-col space-y-2">

      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          // iski value current requirement hogi 
          // har baar change hone pe value requirement me store honi chahiye
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
        {/* Add button to add requirement into requirement list */}
        <button
          type="button"
          onClick={handleAddRequirement}
          className="font-semibold text-yellow-50"
        >
          Add
        </button>
      </div>

      {/* jb bhi add krege to sath me display horha hoga or ek clear button available hoga */}
      {/* if length > 0 tbhi add k baad display krwana h */}
      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              {/* requirement */}
              <span>{requirement}</span>
              {/* clear button that removes that particular requirement */}
              <button
                type="button"
                className="ml-2 text-xs text-pure-greys-300 "
                onClick={() => handleRemoveRequirement(index)}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* agr yha koi error aata hai then display it */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}

    </div>
  )
}