import * as React from 'react'

import { SubmitHandler } from 'react-hook-form'

import { api } from '@/lib/config'
import fetcher from '@/lib/fetcher'
import { ClubMember } from '@/lib/ClubMember'

import MembershipForm from './MembershipForm'

export default function NewMembershipPage() {
  const onConfirm: SubmitHandler<ClubMember> = async (formData) => {
    console.log('New subscription', formData)
    try {
      const result = await fetcher(api.createNewMember, {
        method: 'POST',
        body: JSON.stringify(formData.serialize())
      })
      console.log('Success!', result)
    } catch (error) {
      console.log('Failed =(', error)
    }
  }

  return <MembershipForm mode='add' onConfirm={onConfirm} />
}
