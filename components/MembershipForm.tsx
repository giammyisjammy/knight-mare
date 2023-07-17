import * as React from 'react'
import VisuallyHidden from './VisuallyHidden'
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'

enum GenderEnum {
  female = 'female',
  male = 'male',
  other = 'other'
}

export interface IFormInput {
  name: string
  gender: GenderEnum
}

type Props =
  | {
      onConfirm: SubmitHandler<undefined>
      onInvalid?: SubmitErrorHandler<IFormInput>
    } & (
      | {
          mode: 'edit'
          user: IFormInput
        }
      | {
          mode: 'add'
          user?: never
        }
    )
export default function MembershipForm({
  onConfirm,
  onInvalid,
  mode,
  user
}: Props) {
  const { register, handleSubmit } = useForm<IFormInput>({
    defaultValues: {
      name: mode === 'edit' ? user.name : '',
      gender: GenderEnum.male
    }
  })

  return (
    <form onSubmit={handleSubmit(onConfirm, onInvalid)}>
      <h1>Personal information</h1>
      <p>Type your personal information here</p>
      <TextField
        label='First Name'
        placeholder='Type here...'
        {...register('name')}
      />
      <SelectField label='Gender Selection' {...register('gender')}>
        <option value='female'>female</option>
        <option value='male'>male</option>
        <option value='other'>other</option>
      </SelectField>
      <input type='submit' />
    </form>
  )
}

type TextFieldProps = {
  placeholder: string
  label: string
  name?: string
  value?: string | number | readonly string[]
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  disabled?: boolean
  issues?: string[]
  // onChange?: (value: string) => void
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

// eslint-disable-next-line react/display-name
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    return (
      <div>
        <label>{props.label}</label>
        <VisuallyHidden>{props.label}</VisuallyHidden>
        <input
          name={props.name}
          type='text'
          value={props.value}
          onChange={(e) => props.onChange(e)}
          onBlur={props.onBlur}
          disabled={props.disabled}
          ref={ref}
        />
        <ul>
          {props.issues?.map((issue) => (
            <li key={`${props.name}_${issue}`}>{issue}</li>
          ))}
        </ul>
      </div>
    )
  }
)

type SelectFieldProps = {
  label: string
  name?: string
  value?: string | number | readonly string[]
  onBlur?: React.FocusEventHandler<HTMLSelectElement>
  disabled?: boolean
  issues?: string[]
  // onChange?: (value: string) => void
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  children?: React.JSX.Element[]
}

// eslint-disable-next-line react/display-name
export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>((props, ref) => {
  return (
    <div>
      <label>{props.label}</label>
      <VisuallyHidden>{props.label}</VisuallyHidden>
      <select
        name={props.name}
        value={props.value}
        onChange={(e) => props.onChange(e)}
        disabled={props.disabled}
        ref={ref}
      >
        {props.children}
      </select>
      <ul>
        {props.issues?.map((issue) => (
          <li key={`${props.name}_${issue}`}>{issue}</li>
        ))}
      </ul>
    </div>
  )
})
