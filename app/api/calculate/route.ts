import { NextResponse } from 'next/server';
import { supabase, Salary, City, Result } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. 从 salaries 表读取所有数据
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('*');

    if (salariesError) {
      return NextResponse.json(
        { error: '读取工资数据失败: ' + salariesError.message },
        { status: 500 }
      );
    }

    if (!salaries || salaries.length === 0) {
      return NextResponse.json(
        { error: '没有工资数据，请先上传员工工资数据' },
        { status: 400 }
      );
    }

    // 2. 按员工姓名分组，计算年度月平均工资
    const employeeSalaries = new Map<string, number[]>();

    salaries.forEach((salary: Salary) => {
      if (!employeeSalaries.has(salary.employee_name)) {
        employeeSalaries.set(salary.employee_name, []);
      }
      employeeSalaries.get(salary.employee_name)!.push(salary.salary_amount);
    });

    const avgSalaries = new Map<string, number>();
    employeeSalaries.forEach((amounts, name) => {
      const sum = amounts.reduce((a, b) => a + b, 0);
      const avg = sum / amounts.length;
      avgSalaries.set(name, avg);
    });

    // 3. 从 cities 表获取佛山的数据
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .eq('city_name', '佛山')
      .single();

    if (citiesError || !cities) {
      return NextResponse.json(
        { error: '获取佛山社保标准失败，请先上传城市标准数据: ' + (citiesError?.message || '未找到数据') },
        { status: 500 }
      );
    }

    const cityData = cities as City;
    const { base_min, base_max, rate } = cityData;

    // 4. 计算每位员工的最终缴费基数和公司缴纳金额
    const results: Omit<Result, 'id'>[] = [];

    avgSalaries.forEach((avgSalary, employeeName) => {
      // 确定最终缴费基数
      let contributionBase: number;
      if (avgSalary < base_min) {
        contributionBase = base_min;
      } else if (avgSalary > base_max) {
        contributionBase = base_max;
      } else {
        contributionBase = avgSalary;
      }

      // 计算公司应缴纳金额
      const companyFee = contributionBase * rate;

      results.push({
        employee_name: employeeName,
        avg_salary: Math.round(avgSalary * 100) / 100, // 保留两位小数
        contribution_base: Math.round(contributionBase * 100) / 100,
        company_fee: Math.round(companyFee * 100) / 100,
      });
    });

    // 5. 清空 results 表
    const { error: deleteError } = await supabase
      .from('results')
      .delete()
      .neq('id', 0); // 删除所有记录

    if (deleteError) {
      return NextResponse.json(
        { error: '清空结果表失败: ' + deleteError.message },
        { status: 500 }
      );
    }

    // 6. 将计算结果存入 results 表
    const { error: insertError } = await supabase
      .from('results')
      .insert(results);

    if (insertError) {
      return NextResponse.json(
        { error: '保存计算结果失败: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `计算完成，共处理 ${results.length} 位员工`,
      count: results.length,
    });

  } catch (error) {
    console.error('计算过程中出错:', error);
    return NextResponse.json(
      { error: '计算过程中出现错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
