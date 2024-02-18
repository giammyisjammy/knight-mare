import * as React from 'react'

import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import it from 'date-fns/locale/it'
import {
  FormContainer,
  TextFieldElement,
  CheckboxElement,
  DatePickerElement,
  useForm,
  SubmitHandler,
  SubmitErrorHandler
} from 'react-hook-form-mui'

import { ClubMember } from '@/lib/ClubMember'
import type { MembershipType } from '@/lib/types'

import { Loading } from '../Loading'

import styles from '../styles.module.css'

import { PhoneInput } from './components'
import DateFnsProvider from './DateFnsProvider'
// import VisuallyHidden from './VisuallyHidden'

// TODO remove, this shouldn't need to reset the theme.
const defaultTheme = createTheme()

type Props =
  | {
      className?: string
      membershipTypes: MembershipType[]
      onConfirm: SubmitHandler<ClubMember | undefined> // HACK should be just undefined
      onInvalid?: SubmitErrorHandler<ClubMember>
    } & (
      | {
          mode: 'edit'
          memberInfo: ClubMember
        }
      | {
          mode: 'add'
          memberInfo?: never
        }
    )
export function MembershipForm({
  className,
  membershipTypes,
  onConfirm,
  onInvalid,
  mode,
  memberInfo
}: Props) {
  const defaultValues = mode === 'edit' ? memberInfo : new ClubMember()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const formContext = useForm({ defaultValues })
  const { reset, formState } = formContext

  React.useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState, isSubmitting, reset])

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <DateFnsProvider adapterLocale={it}>
          <FormContainer
            defaultValues={defaultValues}
            formContext={formContext}
            onSuccess={async (values) => {
              setIsSubmitting(true)
              try {
                await onConfirm(values)
              } catch {
                //
              } finally {
                setIsSubmitting(false)
              }
            }}
            onError={onInvalid}
          >
            <Container
              component='main'
              className={className} /* maxWidth='xs' */
            >
              <CssBaseline />
              <Box
                sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <TextFieldElement
                    id='firstName'
                    margin='normal'
                    required
                    fullWidth
                    label='Nome'
                    name='firstName'
                    autoComplete='given-name'
                    autoFocus
                  />
                  <TextFieldElement
                    id='lastName'
                    margin='normal'
                    required
                    fullWidth
                    label='Cognome'
                    name='lastName'
                    autoComplete='family-name'
                  />
                  <TextFieldElement
                    id='fiscalCode'
                    margin='normal'
                    required
                    fullWidth
                    label='Codice Fiscale'
                    name='fiscalCode'
                    // autoComplete='fiscalCode'
                  />
                  <DatePickerElement
                    name='birthDate'
                    label='Data di Nascita'
                    required
                    disableFuture
                    sx={{ mt: 2, mb: 1 }} // same as margin='normal'
                    // fullWidth
                  />

                  <TextFieldElement
                    id='birthPlace'
                    margin='normal'
                    required
                    fullWidth
                    label='Nato/a a'
                    name='birthPlace'
                    autoComplete='birthPlace'
                  />
                  <TextFieldElement
                    id='birthProvince'
                    margin='normal'
                    required
                    fullWidth
                    label='Provincia di Nascita'
                    name='birthProvince'
                  />

                  <TextFieldElement
                    id='address'
                    margin='normal'
                    required
                    fullWidth
                    label='Indirizzo'
                    name='address'
                    autoComplete='street-address'
                  />
                  <TextFieldElement
                    id='city'
                    margin='normal'
                    required
                    fullWidth
                    label='Residente in'
                    name='city'
                    autoComplete='address-level2'
                  />
                  <TextFieldElement
                    id='cityProvince'
                    margin='normal'
                    required
                    fullWidth
                    label='Provincia di Residenza'
                    name='cityProvince'
                    autoComplete='address-level1'
                  />
                  <TextFieldElement
                    id='CAP'
                    margin='normal'
                    required
                    fullWidth
                    label='CAP'
                    name='CAP'
                    autoComplete='postal-code'
                  />

                  <TextFieldElement
                    id='phoneNr'
                    label='Telefono'
                    name='phoneNr'
                    margin='normal'
                    required
                    fullWidth
                    autoComplete='tel'
                    component={PhoneInput}
                  />
                  <TextFieldElement
                    id='email'
                    margin='normal'
                    required
                    fullWidth
                    label='Indirizzo Email'
                    name='email'
                    autoComplete='email'
                  />

                  <TextFieldElement
                    id='membershipType'
                    name='membershipType'
                    select
                    margin='normal'
                    required
                    fullWidth
                    label='Tipologia Affiliazione'
                    defaultValue=''
                  >
                    {membershipTypes.map((value) => (
                      <MenuItem key={value.id} value={value.name}>
                        {value.name}
                      </MenuItem>
                    ))}
                  </TextFieldElement>

                  <CheckboxElement
                    name='privacyConsent'
                    label='Consenso Privacy'
                    color='primary'
                    required
                  />
                  <br />
                  <CheckboxElement
                    name='imagesConsent'
                    label='Consenso Trattamento Immagini'
                    color='primary'
                    required
                  />

                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    sx={{ mt: 3, mb: 2 }}
                    disabled={isSubmitting}
                  >
                    Invia
                  </Button>
                </Box>
              </Box>
              {isSubmitting && (
                <div className={styles.overlay}>
                  <Loading />
                </div>
              )}
            </Container>
          </FormContainer>
        </DateFnsProvider>
      </ThemeProvider>
    </>
  )
}
