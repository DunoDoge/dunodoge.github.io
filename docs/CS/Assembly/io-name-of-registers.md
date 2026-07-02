# 寄存器名称含义

复习中发现汇编中的寄存器名称不是空穴来风，在此记录一下：

- 数据寄存器
    - 'AX'：Accumulator Register，累加器寄存器
    - 'BX'：Base Register，基址寄存器
    - 'CX'：Count Register，计数寄存器
    - 'DX'：Data Register，数据寄存器
- 地址指针和变址寄存器
    - 'SP'：Stack Pointer，栈指针寄存器
    - 'BP'：Base Pointer，基指针寄存器
    - 'SI'：Source Index，源变址寄存器
    - 'DI'：Destination Index，目的变址寄存器
- 段寄存器
    - 'CS'：Code Segment，代码段寄存器
    - 'DS'：Data Segment，数据段寄存器
    - 'SS'：Stack Segment，栈段寄存器
    - 'ES'：Extra Segment，附加段寄存器
- 指令指针
    - 'IP'：Instruction Pointer，指令指针寄存器

除此之外，标志寄存器设置了各种状态标志，如零标志（ZF）、符号标志（SF）等，这些标志的名称也反映了它们的功能。