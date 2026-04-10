/* @flow */
import React, { type Node } from 'react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'

type Props = {
    label: string,
    max: number,
    min: number,
    onChange: (event: any, value: number | number[]) => mixed,
    step: number,
    value: number
}

export default function EditorSliderRow({ label, max, min, onChange, step, value }: Props): Node {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ flex: '1 1 25%', mr: 1.5 }}>{label}</Typography>
            <Slider sx={{ flex: '1 1 75%', mx: 2 }} max={max} min={min} onChange={onChange} step={step} value={value} />
            <Typography>{value}</Typography>
        </Box>
    )
}
