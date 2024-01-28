import * as React from 'react'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'

import { IMaskInput } from 'react-imask'

interface TextMaskCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}
const TextMaskCustom = React.forwardRef<HTMLElement, TextMaskCustomProps>(
  (props, ref) => {
    const { onChange, ...other } = props
    return (
      <IMaskInput
        {...other}
        mask='(+39) 000-000-0000'
        // definitions={{
        //   '#': /[1-9]/,
        // }}
        inputRef={ref as React.ForwardedRef<HTMLInputElement>}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    )
  }
)
TextMaskCustom.displayName = 'TextMaskCustom'

export const PhoneInput = ({
  id,
  margin,
  required,
  label,
  error,
  helperText,
  fullWidth,
  ...rest
}) => (
  <FormControl
    margin={margin}
    required={required}
    error={error}
    fullWidth={fullWidth}
  >
    <InputLabel htmlFor={id}>{label}</InputLabel>
    <OutlinedInput {...rest} inputComponent={TextMaskCustom as any} />
    {error && <FormHelperText id={id}>{helperText}</FormHelperText>}
  </FormControl>
)
