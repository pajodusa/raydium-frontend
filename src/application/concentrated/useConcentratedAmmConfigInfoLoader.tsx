import jFetch from '@/functions/dom/jFetch'
import { toPercent } from '@/functions/format/toPercent'
import { div } from '@/functions/numberish/operations'
import useAsyncEffect from '@/hooks/useAsyncEffect'
import { ApiAmmV3ConfigInfo } from '@raydium-io/raydium-sdk'
import useAppSettings from '../common/useAppSettings'
import useConcentrated from './useConcentrated'

/**
 * will load concentrated info (jsonInfo, sdkParsedInfo, hydratedInfo)
 * @todo just register hooks in specific component
 */
export default function useConcentratedAmmConfigInfoLoader() {
  const availableAmmConfigFeeOptions = useConcentrated((s) => s.availableAmmConfigFeeOptions)
  const inDev = useAppSettings((s) => s.inDev)

  /** fetch api json info list  */
  useAsyncEffect(async () => {
    if (availableAmmConfigFeeOptions?.length) return
    const response = await jFetch<{ data: Record<string, ApiAmmV3ConfigInfo> }>(
      'https://api.raydium.io/v2/ammV3/ammConfigs'
    )
    if (response) {
      useConcentrated.setState({
        availableAmmConfigFeeOptions: Object.values(response.data).map((i) => {
          const original = inDev
            ? {
                ...i,
                id: '85JxuepKfJsmb29ZKThuod3yeBS4dXmsCQUbeo1utpeX',
                index: 0,
                protocolFeeRate: 12000,
                tradeFeeRate: 100,
                tickSpacing: 10
              }
            : i
          return {
            ...original,
            original,
            protocolFeeRate: toPercent(div(original.protocolFeeRate, 10 ** 4), { alreadyDecimaled: true }),
            tradeFeeRate: toPercent(div(original.tradeFeeRate, 10 ** 4), { alreadyDecimaled: true })
          }
        })
      })
    }
  }, [inDev])
}
