import { Box, Typography, Divider } from '@mui/material'
import React from 'react'
import DraggableNode from '../components/DraggableNode'
import LineDrawingTool from '../components/LineDrawingTool'

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

  const lineTypes = [
    {
      type: 'straight' as const,
      label: 'Straight Line',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <line x1="5" y1="20" x2="35" y2="20" stroke="#333" strokeWidth="3"/>
        </svg>
      )
    },
    {
      type: 'single-arrow' as const,
      label: 'Single Arrow',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <line x1="5" y1="20" x2="30" y2="20" stroke="#333" strokeWidth="3"/>
          <polygon points="30,20 25,15 25,25" fill="#333"/>
        </svg>
      )
    },
    {
      type: 'double-arrow' as const,
      label: 'Double Arrow',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <line x1="10" y1="20" x2="30" y2="20" stroke="#333" strokeWidth="3"/>
          <polygon points="10,20 15,15 15,25" fill="#333"/>
          <polygon points="30,20 25,15 25,25" fill="#333"/>
        </svg>
      )
    },
    {
      type: 'dashed' as const,
      label: 'Dashed Line',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <line x1="5" y1="20" x2="35" y2="20" stroke="#333" strokeWidth="3" strokeDasharray="5,5"/>
        </svg>
      )
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
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 3 }}>
        {nodeTypes.map((nodeType) => (
          <DraggableNode
            key={nodeType.type}
            type={nodeType.type}
            svgPath={nodeType.svgPath}
            label={nodeType.label}
          />
        ))}
      </Box>

      <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
        Drawing Tools
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {lineTypes.map((lineType) => (
          <LineDrawingTool
            key={lineType.type}
            type={lineType.type}
            label={lineType.label}
            icon={lineType.icon}
          />
        ))}
      </Box>
    </Box> 
  )
}

export default LeftDrawer