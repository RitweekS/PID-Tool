import { Box, Typography, Divider } from '@mui/material'
import React from 'react'
import DraggableNode from '../components/DraggableNode'

const LeftDrawer = () => {
  const nodeTypes = [
    {
      type: 'compressor',
      svgPath: '/Compressor.svg',
      label: 'Compressor'
    },
    {
      type: 'condenser',
      svgPath: '/condenser.svg',
      label: 'Condenser'
    },
    {
      type: 'evaporator',
      svgPath: '/Evaporators.svg',
      label: 'Evaporator'
    },
    {
      type: 'heatExchanger',
      svgPath: '/HeatExchanger.svg',
      label: 'Heat Exchanger'
    }
  ];

  return (
    <Box sx={{
        width: '250px',
        height: '100%',
        flexShrink: 0,
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        padding: 2,
        overflowY: 'auto',
    }}>
      <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
        Components
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {nodeTypes.map((nodeType) => (
          <DraggableNode
            key={nodeType.type}
            type={nodeType.type}
            svgPath={nodeType.svgPath}
            label={nodeType.label}
          />
        ))}
      </Box>
    </Box> 
  )
}

export default LeftDrawer