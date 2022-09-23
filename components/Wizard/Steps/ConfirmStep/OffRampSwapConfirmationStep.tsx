import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useFormWizardaUpdate, useFormWizardState } from '../../../../context/formWizardProvider';
import { useSwapDataState, useSwapDataUpdate } from '../../../../context/swap';
import { SwapCreateStep } from '../../../../Models/Wizard';
import SubmitButton from '../../../buttons/submitButton';
import toast from 'react-hot-toast';
import AddressDetails from '../../../DisclosureComponents/AddressDetails';
import TokenService from '../../../../lib/TokenService';
import { BransferApiClient } from '../../../../lib/bransferApiClients';
import NetworkSettings from '../../../../lib/NetworkSettings';
import WarningMessage from '../../../WarningMessage';
import SwapConfirmMainData from '../../../Common/SwapConfirmMainData';
import { ApiError, KnownwErrorCode } from '../../../../Models/ApiError';

const OffRampSwapConfirmationStep: FC = () => {
    const { swapFormData, swap } = useSwapDataState()
    const { exchange, amount, currency } = swapFormData || {}
    const { currentStepName } = useFormWizardState<SwapCreateStep>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { createAndProcessSwap, updateSwapFormData } = useSwapDataUpdate()
    const { goToStep } = useFormWizardaUpdate<SwapCreateStep>()
    const { network } = swapFormData || {}
    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (currentStepName !== SwapCreateStep.Confirm)
                return true

            const authData = TokenService.getAuthData();
            if (!authData) {
                goToStep(SwapCreateStep.Email)
                return;
            }
            const bransferApiClient = new BransferApiClient()
            const response = await bransferApiClient.GetExchangeDepositAddress(exchange?.baseObject?.internal_name, currency?.baseObject?.asset?.toUpperCase(), authData.access_token)
            updateSwapFormData((old) => ({ ...old, destination_address: response.data }))
        })()
    }, [currentStepName])

    const minimalAuthorizeAmount = Math.round(currency?.baseObject?.usd_price * Number(amount) + 5)
    const transferAmount = `${amount} ${currency?.name}`

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true)
        try {
            const swapId = await createAndProcessSwap();
            router.push(`/${swapId}`)
        }
        catch (error) {
            const data: ApiError = error.response
            toast.error(data?.message)
        }
        finally {
            setIsSubmitting(false)
        }
    }, [network, swap, transferAmount])

    return (
        <>
            <div className='px-6 md:px-8 h-full flex flex-col justify-between'>
                <SwapConfirmMainData>
                    {
                        NetworkSettings.KnownSettings[network?.baseObject?.id]?.ConfirmationWarningMessage &&
                        <WarningMessage className='mb-4'>
                            <p className='font-normal text-sm text-darkblue-600'>
                                {NetworkSettings.KnownSettings[network?.baseObject?.id]?.ConfirmationWarningMessage}
                            </p>
                        </WarningMessage>
                    }
                    <AddressDetails canEditAddress={false} />
                </SwapConfirmMainData>
                <SubmitButton type='submit' isDisabled={false} icon="" isSubmitting={isSubmitting} onClick={handleSubmit}>
                    Confirm
                </SubmitButton>
            </div>
        </>
    )
}

export default OffRampSwapConfirmationStep;
